import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let client;
  
  try {
    const { id } = params;
    const body = await request.json();
    const { title, username, password, url, notes, userId } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid password ID' }, { status: 400 });
    }

    const { db, client: connectedClient } = await connectToDatabase();
    client = connectedClient;
    
    // Check if password exists and belongs to user
    const existing = await db.collection('passwords').findOne({ 
      _id: new ObjectId(id), 
      userId 
    });

    if (!existing) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (username) updateData.username = username;
    if (url !== undefined) updateData.url = url;
    if (notes !== undefined) updateData.notes = notes;

    // Password is already encrypted from client, just store it directly
    if (password) {
      updateData.password = password;
    }

    const result = await db.collection('passwords').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let client;
  
  try {
    const { id } = params;
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