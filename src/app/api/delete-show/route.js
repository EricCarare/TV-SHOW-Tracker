import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: "ID lipsă" }), {
      status: 400,
    });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: "Neautorizat" }), {
        status: 401,
      });
    }

    const client = await clientPromise;
    const db = client.db("tvtracker");

    const result = await db.collection("watchlist").deleteOne({
      _id: new ObjectId(id),
      userEmail: session.user.email, 
    });

    if (result.deletedCount === 1) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, error: "Nu s-a găsit sau nu aparține utilizatorului" }), {
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
