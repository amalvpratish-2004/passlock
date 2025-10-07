import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { title, username, password, url, notes, userId } = body;

    // Validate required fields
    if (!title || !username || !password || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, username, password, userId' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db, client: connectedClient } = await connectToDatabase();
    client = connectedClient;

    // Create password document with ALREADY ENCRYPTED data from client
    const passwordDoc = {
      title,        // Already encrypted by client
      username,     // Already encrypted by client
      password,     // Already encrypted by client
      url: url || null,     // Already encrypted by client (or null)
      notes: notes || null, // Already encrypted by client (or null)
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to MongoDB
    const result = await db.collection('passwords').insertOne(passwordDoc);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: 'Password saved successfully'
    });

  } catch (error) {
    console.error('Error saving password:', error);
    return NextResponse.json(
      { error: 'Failed to save password' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function GET(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { db, client: connectedClient } = await connectToDatabase();
    client = connectedClient;

    const passwords = await db.collection('passwords')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Return the encrypted data as-is - client will decrypt it
    const formattedPasswords = passwords.map(password => ({
      id: password._id.toString(),
      title: password.title,        // Encrypted - client will decrypt
      username: password.username,  // Encrypted - client will decrypt
      password: password.password,  // Encrypted - client will decrypt
      url: password.url,            // Encrypted - client will decrypt
      notes: password.notes,        // Encrypted - client will decrypt
      lastModified: password.updatedAt,
      created: password.createdAt
    }));

    return NextResponse.json({ passwords: formattedPasswords });

  } catch (error) {
    console.error('Error fetching passwords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passwords' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}