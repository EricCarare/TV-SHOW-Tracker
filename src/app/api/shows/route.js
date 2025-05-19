import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify([]), { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("tvtracker");

    const shows = await db
      .collection("watchlist")
      .find({ userEmail: session.user.email }) // filtrare pe utilizator
      .toArray();

    return new Response(JSON.stringify(shows), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Eroare la citire:", error);
    return new Response(JSON.stringify({ success: false, error: "Eroare la citirea din MongoDB" }), {
      status: 500,
    });
  }
}

