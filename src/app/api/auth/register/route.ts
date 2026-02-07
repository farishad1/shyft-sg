import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';
import { userRegisterSchema, workerProfileSchema, hotelProfileSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 1. Validate Base User Data
        const baseResult = userRegisterSchema.safeParse(body);
        if (!baseResult.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: baseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password, role } = baseResult.data;

        // 2. Check for existing user
        if (!prisma) throw new Error('Database not available');

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // 3. Hash Password
        const passwordHash = await hashPassword(password);

        // 4. Create User based on Role
        if (role === 'WORKER') {
            const workerResult = workerProfileSchema.safeParse(body);
            if (!workerResult.success) {
                return NextResponse.json(
                    { error: 'Worker Validation Error', details: workerResult.error.flatten() },
                    { status: 400 }
                );
            }

            const workerData = workerResult.data;

            // AUTO-VERIFY LOGIC: If phone is verified, set to VERIFIED immediately
            // Workers can book shifts, but isDocumentVerified stays false for admin review before payout
            const isPhoneVerified = body.isPhoneVerified === true;
            const autoVerifyStatus = isPhoneVerified ? 'VERIFIED' : 'PENDING';

            const newUser = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role: 'WORKER',
                    workerProfile: {
                        create: {
                            firstName: workerData.firstName,
                            lastName: workerData.lastName,
                            dateOfBirth: workerData.dateOfBirth,
                            phoneNumber: workerData.phoneNumber,
                            isPhoneVerified: isPhoneVerified,
                            workPassType: workerData.workPassType,
                            workPassNumber: workerData.workPassNumber,
                            schoolName: workerData.schoolName,
                            hasBasicEnglish: workerData.hasBasicEnglish,
                            hasComputerSkills: workerData.hasComputerSkills,
                            // AUTO-VERIFY: Set status based on phone verification
                            verificationStatus: autoVerifyStatus,
                            verifiedAt: isPhoneVerified ? new Date() : null,
                            // SAFETY NET: Document still needs admin verification before payout
                            isDocumentVerified: false,
                        },
                    },
                },
            });

            return NextResponse.json({
                success: true,
                userId: newUser.id,
                role: 'WORKER',
                isVerified: isPhoneVerified,
                message: isPhoneVerified
                    ? 'Account created and verified! You can start booking shifts.'
                    : 'Account created. Pending verification.'
            });

        } else if (role === 'HOTEL') {
            const hotelResult = hotelProfileSchema.safeParse(body);
            if (!hotelResult.success) {
                return NextResponse.json(
                    { error: 'Hotel Validation Error', details: hotelResult.error.flatten() },
                    { status: 400 }
                );
            }

            const hotelData = hotelResult.data;

            const newUser = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role: 'HOTEL',
                    hotelProfile: {
                        create: {
                            hotelName: hotelData.hotelName,
                            uen: hotelData.uen,
                            location: hotelData.location,
                            description: hotelData.description,
                            // Other fields use defaults (verificationStatus: PENDING)
                        },
                    },
                },
            });

            return NextResponse.json({
                success: true,
                userId: newUser.id,
                role: 'HOTEL',
                message: 'Account created successfully. Please log in.'
            });
        }

        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    } catch (error) {
        console.error('[RegisterAPI] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
