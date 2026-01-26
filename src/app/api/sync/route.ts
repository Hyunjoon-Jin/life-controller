import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { schedulerData: true },
        });

        if (!user?.schedulerData) {
            return NextResponse.json({ data: null });
        }

        return NextResponse.json({ data: user.schedulerData.data });
    } catch (error) {
        console.error('Sync GET error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await prisma.schedulerData.upsert({
            where: { userId: user.id },
            update: { data },
            create: { userId: user.id, data },
        });

        return NextResponse.json({ message: 'Synced successfully' });
    } catch (error) {
        console.error('Sync POST error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
