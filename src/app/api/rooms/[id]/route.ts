import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    let room;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      room = await Room.findById(id);
    }
    if (!room) {
      room = await Room.findOne({ slug: id });
    }

    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Creator studio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: room }, { status: 200 });
  } catch (error: any) {
    console.error('Room detail error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch room' },
      { status: 500 }
    );
  }
}
