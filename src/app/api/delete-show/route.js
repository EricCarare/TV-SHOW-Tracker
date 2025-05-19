import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: "ID lipsă" }), {
      status: 400,
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("tvtracker");

    const result = await db.collection("watchlist").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, error: "Nu s-a găsit elementul" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error("Eroare la ștergere:", error);
    return new Response(JSON.stringify({ success: false, error: "Eroare la ștergere" }), {
      status: 500,
    });
  }
}
