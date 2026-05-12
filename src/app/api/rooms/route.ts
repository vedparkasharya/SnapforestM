import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const rooms = await Room.find(query).sort(sort);

    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error: any) {
    console.error('Rooms GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
