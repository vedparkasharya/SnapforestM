import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roomId, duration } = body;

    if (!roomId || !duration) {
      return NextResponse.json(
        { success: false, message: 'Room ID and duration required' },
        { status: 400 }
      );
    }

    await connectDB();
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Creator studio not found' },
        { status: 404 }
      );
    }

    const amount = Math.ceil(duration * room.pricePerHour);
    const receipt = `rcpt_${Date.now()}`;

    const order = await createRazorpayOrder(amount, receipt);

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}
