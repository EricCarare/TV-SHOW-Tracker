import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function PATCH(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const rating = parseInt(searchParams.get("rating"));

  if (!id || isNaN(rating) || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ success: false, error: "Date invalide" }), { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: "Neautorizat" }), { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("tvtracker");

    const result = await db.collection("watchlist").updateOne(
      { _id: new ObjectId(id), userEmail: session.user.email },
      { $set: { rating } }
    );

    return new Response(JSON.stringify({ success: result.modifiedCount === 1 }), {
      status: 200
    });
  } catch (error) {
    console.error("Eroare la salvare rating:", error);
    return new Response(JSON.stringify({ success: false, error: "Eroare la rating" }), {
      status: 500
    });
  }
}
