import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  let client;
  try {
    const { id } = await params; // Await the params
    
    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const { db, client: connectedClient } = await connectToDatabase();
    client = connectedClient;

    const existing = await db.collection("account").findOne({
      userId: new ObjectId(id),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(existing);
  } catch (error) {
    console.error("Error getting account details:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}