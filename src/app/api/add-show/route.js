import clientPromise from "@/lib/mongodb"; 

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("tvtracker");

    const result = await db.collection("watchlist").insertOne(body);

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
