import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("tvtracker");

    const show = await db.collection("watchlist").findOne({ showId: Number(params.id) });

    if (!show) {
      return new Response(JSON.stringify({ error: "Serialul nu există" }), { status: 404 });
    }

    return new Response(JSON.stringify(show), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Eroare la GET serial" }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("tvtracker");

    const { episodesWatched } = await req.json();

    const result = await db.collection("watchlist").updateOne(
      { showId: Number(params.id) },
      { $set: { episodesWatched } }
    );

    return new Response(JSON.stringify({ success: true, updated: result.modifiedCount }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Eroare la PATCH serial" }), { status: 500 });
  }
}
