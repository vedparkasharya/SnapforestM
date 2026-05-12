import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
import { sendBookingConfirmationEmail } from '@/lib/email';

function generateBookingId() {
  return 'SF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = (session.user as any).id;

    const bookings = await Booking.find({ user: userId })
      .populate('room', 'name images address city category')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bookings }, { status: 200 });
  } catch (error: any) {
    console.error('Bookings GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

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
    const { roomId, date, startTime, endTime, damagePolicyAccepted, paymentId, orderId, razorpayPaymentId, razorpaySignature } = body;

    if (!roomId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    const bookingDate = new Date(date);
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalAmount = Math.ceil(duration * room.pricePerHour);

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      room: roomId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        { success: false, message: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    const userId = (session.user as any).id;
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      user: userId,
      room: roomId,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
      status: paymentId ? 'confirmed' : 'pending',
      paymentStatus: paymentId ? 'paid' : 'pending',
      paymentId,
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      damagePolicyAccepted: damagePolicyAccepted || false,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room', 'name address city');

    // Send confirmation email
    if (session.user.email && paymentId) {
      await sendBookingConfirmationEmail(session.user.email, {
        bookingId,
        roomName: room.name,
        date: new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        startTime,
        endTime,
        duration,
        totalAmount,
        address: room.address,
      });
    }

    return NextResponse.json(
      { success: true, data: populatedBooking, bookingId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking create error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
