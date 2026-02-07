import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Contact Form API Route
 * 
 * Routing Logic (as specified):
 * - If sender is a Registered User → Reply goes to their In-App Messages Tab
 * - If sender is a Guest → Reply goes to their Email
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if the email belongs to a registered user
        let registeredUser = null;
        let isFromRegisteredUser = false;

        // Only query DB if prisma is available
        if (prisma) {
            try {
                registeredUser = await prisma.user.findUnique({
                    where: { email },
                });
                isFromRegisteredUser = !!registeredUser;
            } catch (dbError) {
                console.log('[ContactAPI] Database query failed:', dbError);
            }

            // Save the contact submission
            try {
                await prisma.contactSubmission.create({
                    data: {
                        name,
                        email,
                        phone: phone || null,
                        subject,
                        message,
                        isFromRegisteredUser,
                        registeredUserId: registeredUser?.id || null,
                    },
                });
            } catch (dbError) {
                console.log('[ContactAPI] Failed to save contact submission:', dbError);
            }
        } else {
            // No database connection - log for development
            console.log('[ContactAPI] No DB connection. Would save contact submission:', {
                name,
                email,
                subject,
            });
        }

        // If registered user, also create an in-app message
        if (registeredUser) {
            console.log(`[ContactAPI] Registered user ${email} - reply will go to In-App Messages`);
            // In production: Create a Message record to the user from SYSTEM/ADMIN
        } else {
            console.log(`[ContactAPI] Guest ${email} - reply will be sent via email`);
            // In production: Send confirmation email and queue admin notification
        }

        return NextResponse.json({
            success: true,
            message: 'Contact form submitted successfully',
            isRegisteredUser: isFromRegisteredUser,
        });

    } catch (error) {
        console.error('[ContactAPI] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
