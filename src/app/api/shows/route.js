import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("tvtracker");

    const shows = await db.collection("watchlist").find().toArray();

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
