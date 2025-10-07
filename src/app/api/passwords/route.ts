import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { encryptionService } from '@/lib/encryption'; // Server-side only!

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

    // Encrypt the password on the server
    const encryptedPassword = await encryptionService.encryptPasswordForStorage(password);
    const encryptedTitle = await encryptionService.encryptPasswordForStorage(title);
    const encryptedUsername = await encryptionService.encryptPasswordForStorage(username);
    const encryptedUrl = url ? await encryptionService.encryptPasswordForStorage(url) : null;
    const encryptedNotes = notes ? await encryptionService.encryptPasswordForStorage(notes) : null;

    // Create password document with encrypted password
    const passwordDoc = {
      title: encryptedTitle,
      username : encryptedUsername,
      password: encryptedPassword, 
      url: encryptedUrl,
      notes: encryptedNotes,
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

    // Decrypt passwords on the server before sending to client
    const decryptedPasswords = await Promise.all(
      passwords.map(async (doc) => {
        try {
          const decryptedPassword = await encryptionService.decryptPasswordFromStorage(doc.password);
          const decryptedTitle = await encryptionService.decryptPasswordFromStorage(doc.title);
          const decryptedUsername = await encryptionService.decryptPasswordFromStorage(doc.username);
          const decryptedUrl = doc.url ? await encryptionService.decryptPasswordFromStorage(doc.url) : null;
          const decryptedNotes = doc.notes ? await encryptionService.decryptPasswordFromStorage(doc.notes) : null;
          return {
            id: doc._id.toString(),
            title: decryptedTitle,
            username: decryptedUsername,
            password: decryptedPassword, // Send decrypted to client
            url: decryptedUrl,
            notes: decryptedNotes,
            lastModified: doc.updatedAt,
            created: doc.createdAt,
          };
        } catch (error) {
          console.error(`Failed to decrypt password for ${doc.title}:`, error);
          return {
            id: doc._id.toString(),
            title: doc.title,
            username: doc.username,
            password: '*** DECRYPTION FAILED ***',
            url: doc.url,
            notes: doc.notes,
            lastModified: doc.updatedAt,
            created: doc.createdAt,
          };
        }
      })
    );

    return NextResponse.json({ passwords: decryptedPasswords });

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