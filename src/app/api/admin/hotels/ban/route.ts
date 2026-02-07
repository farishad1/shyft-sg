import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!prisma) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        // Verify admin role
        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, adminProfile: true }
        });

        if (admin?.role !== 'ADMIN' || !admin.adminProfile?.canBanUsers) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { hotelId, action, reason } = body;

        if (!hotelId || !action) {
            return NextResponse.json({ error: 'Hotel ID and action required' }, { status: 400 });
        }

        if (action === 'ban' && !reason) {
            return NextResponse.json({ error: 'Reason is required for banning' }, { status: 400 });
        }

        const hotelProfile = await prisma.hotelProfile.findUnique({
            where: { id: hotelId }
        });

        if (!hotelProfile) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        if (action === 'ban') {
            await prisma.hotelProfile.update({
                where: { id: hotelId },
                data: {
                    isBanned: true,
                    bannedReason: reason,
                    isActive: false
                }
            });

            return NextResponse.json({
                success: true,
                message: `Hotel "${hotelProfile.hotelName}" has been banned.`
            });
        } else if (action === 'unban') {
            await prisma.hotelProfile.update({
                where: { id: hotelId },
                data: {
                    isBanned: false,
                    bannedReason: null,
                    isActive: true
                }
            });

            return NextResponse.json({
                success: true,
                message: `Hotel "${hotelProfile.hotelName}" has been unbanned.`
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Hotel ban API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
