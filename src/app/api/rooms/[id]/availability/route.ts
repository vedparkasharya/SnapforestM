import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Date is required' },
        { status: 400 }
      );
    }

    const bookings = await Booking.find({
      room: id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime');

    const bookedSlots = bookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));

    return NextResponse.json(
      { success: true, data: { bookedSlots } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
