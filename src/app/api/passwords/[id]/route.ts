import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  let client;
  
  try {
    const { id } = await params; // Await the params to get the actual values
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid password ID' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { db, client: connectedClient } = await connectToDatabase();
    client = connectedClient;

    const result = await db.collection('passwords').deleteOne({ 
      _id: new ObjectId(id), 
      userId 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Password deleted successfully' });

  } catch (error) {
    console.error('Error deleting password:', error);
    return NextResponse.json(
      { error: 'Failed to delete password' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}