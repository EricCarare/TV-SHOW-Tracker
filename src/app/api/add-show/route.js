import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: "Neautorizat" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("tvtracker");

    const result = await db.collection("watchlist").insertOne({
      ...body,
      episodesWatched: [], // inițial e gol
      userEmail: session.user.email, // legăm serialul de utilizator
    });

    return new Response(JSON.stringify({ success: true, insertedId: result.insertedId }), {
      status: 200,
    });
  } catch (error) {
    console.error("Eroare la inserare:", error);
    return new Response(JSON.stringify({ success: false, error: "Eroare la salvare în MongoDB" }), {
      status: 500,
    });
  }
}
