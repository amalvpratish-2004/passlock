import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { encryptionService } from '@/lib/encryption'; // Server-side only!

interface UpdatePasswordBody {
  title?: string;
  username?: string;
  password?: string; // Plain password - will be encrypted
  url?: string;
  notes?: string;
  userId: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    const body: UpdatePasswordBody = await request.json();
    const { title, username, password, url, notes, userId } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid password ID' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate that at least one field is being updated
    if (!title && !username && !password && !url && notes === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { db, client: connectedClient } = await connectToDatabase();
    client = connectedClient;

    // First, verify the password exists and belongs to the user
    const existingPassword = await db.collection('passwords').findOne({ 
      _id: new ObjectId(id), 
      userId 
    });

    if (!existingPassword) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updatedAt: new Date() // Use updatedAt like your other routes
    };

    if (title !== undefined) updateData.title = title;
    if (username !== undefined) updateData.username = username;
    if (url !== undefined) updateData.url = url;
    if (notes !== undefined) updateData.notes = notes;

    // Handle password encryption if provided
    if (password !== undefined) {
      updateData.password = await encryptionService.encryptPasswordForStorage(password);
    }

    // Update the password
    const result = await db.collection('passwords').findOneAndUpdate(
      { 
        _id: new ObjectId(id), 
        userId 
      },
      { 
        $set: updateData 
      },
      { 
        returnDocument: 'after' // Return the updated document
      }
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // Decrypt the password for the response (consistent with GET route)
    const decryptedPassword = await encryptionService.decryptPasswordFromStorage(result.password);

    const updatedPassword = {
      id: result._id.toString(),
      title: result.title,
      username: result.username,
      password: decryptedPassword, // Send decrypted to client
      url: result.url,
      notes: result.notes,
      lastModified: result.updatedAt,
      created: result.createdAt
    };

    return NextResponse.json({ 
      success: true, 
      password: updatedPassword 
    });

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