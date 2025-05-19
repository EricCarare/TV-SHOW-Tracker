"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Trash, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [shows, setShows] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [seasonProgress, setSeasonProgress] = useState({});

  useEffect(() => {
    fetch("/api/shows")
      .then((res) => res.json())
      .then((data) => setShows(data));
  }, []);

  useEffect(() => {
    async function calculateProgress() {
      const progressData = {};

      for (const show of shows) {
        const res = await fetch(`https://api.tvmaze.com/shows/${show.showId}/episodes`);
        if (!res.ok) continue;

        const episodes = await res.json();

        const episodesBySeason = episodes.reduce((acc, ep) => {
          if (!acc[ep.season]) acc[ep.season] = [];
          acc[ep.season].push(ep.id);
          return acc;
        }, {});

        const watched = show.episodesWatched || [];
        const seasonStatus = {};

        for (const [season, epIds] of Object.entries(episodesBySeason)) {
          const allWatched = epIds.every((id) => watched.includes(id));
          seasonStatus[`S${season}`] = allWatched;
        }

        progressData[show.showId] = seasonStatus;
      }

      setSeasonProgress(progressData);
    }

    if (shows.length > 0) {
      calculateProgress();
    }
  }, [shows]);

  const deleteShow = async (id) => {
    const res = await fetch(`/api/delete-show?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const updated = await fetch("/api/shows").then((res) => res.json());
      setShows(updated);
    }
  };

  if (status === "loading") {
    return <p className="text-white p-8">Se încarcă...</p>;
  }

  if (!session) {
    return (
      <main className="p-8 text-white">
        <h1 className="text-3xl mb-4">TV Show Tracker</h1>
        <p className="mb-6">Autentifică-te pentru a continua.</p>
        <button
          onClick={() => signIn("github")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Login cu GitHub
        </button>
      </main>
    );
  }

  const watchedShows = shows.filter((show) => {
    const seasonData = seasonProgress[show.showId];
    return seasonData && Object.values(seasonData).every((v) => v === true);
  });

  const activeShows = shows.filter(
    (s) => !watchedShows.some((w) => w._id === s._id)
  );

  return (
    <main className="p-8 space-y-12">
      <div className="text-sm text-right mb-4 text-white">
        <p className="mb-2">Salut, {session.user.name}</p>
        <button
          onClick={() => signOut()}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>

      <h1 className="text-4xl font-bold text-cyan-200 mb-4">TV Show Tracker</h1>

      {/* FORMULARE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formular manual */}
        <div>
          <h2 className="text-2xl mb-2 text-cyan-200">Adaugă manual</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const title = formData.get("title");
              const showId = Number(formData.get("showId"));
              const image = formData.get("image");

              const res = await fetch("/api/add-show", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, showId, image })
              });

              if (res.ok) {
                e.target.reset();
                const updated = await fetch("/api/shows").then((res) => res.json());
                setShows(updated);
              }
            }}
            className="flex flex-col gap-3"
          >
            <input name="title" placeholder="Titlu serial" required className="bg-slate-800 border border-slate-700 p-2 rounded text-white" />
            <input name="showId" placeholder="ID TVMaze" required className="bg-slate-800 border border-slate-700 p-2 rounded text-white" />
            <input name="image" placeholder="URL imagine" required className="bg-slate-800 border border-slate-700 p-2 rounded text-white" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">Adaugă</button>
          </form>
        </div>

        {/* Căutare TVmaze */}
        <div>
          <h2 className="text-2xl mb-2 text-cyan-200">Caută pe TVmaze</h2>
          <input
            type="text"
            placeholder="Ex: game of thrones"
            className="bg-slate-800 border border-slate-700 p-2 rounded text-white w-full mb-3"
            onChange={async (e) => {
              const q = e.target.value;
              if (q.length < 3) {
                setSearchResults([]);
                return;
              }

              const res = await fetch(`https://api.tvmaze.com/search/shows?q=${q}`);
              const data = await res.json();
              setSearchResults(data);
            }}
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.map((result) => {
              const show = result.show;
              return (
                <li key={show.id} className="bg-slate-800 p-3 rounded shadow hover:scale-105 transition transform duration-200">
                  <img src={show.image?.medium} alt={show.name} className="rounded mb-2" />
                  <h3 className="font-semibold text-white">{show.name}</h3>
                  <button
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    onClick={async () => {
                      const res = await fetch("/api/add-show", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: show.name,
                          showId: show.id,
                          image: show.image?.medium || ""
                        })
                      });

                      if (res.ok) {
                        const updated = await fetch("/api/shows").then((res) => res.json());
                        setShows(updated);
                      }
                    }}
                  >
                    Adaugă în Watchlist
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* WATCHLIST */}
      <section>
        <h2 className="text-2xl mb-4 text-cyan-200 flex items-center gap-2"><Eye size={24} /> Watchlist</h2>
        {activeShows.length === 0 ? (
          <p className="text-gray-400">Nimic în watchlist.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activeShows.map((show) => (
              <Link href={`/serial/${show.showId}`} key={show._id}>
                <li className="cursor-pointer bg-slate-800 p-3 rounded shadow hover:shadow-xl transition text-sm relative hover:scale-105">
                  <img src={show.image} alt={show.title} className="rounded mb-1" />
                  <h3 className="text-white font-semibold">{show.title}</h3>
                  <p className="text-xs text-slate-400">ID: {show.showId}</p>
                  <div className="text-xs mt-1 text-cyan-300">
                    Sezoane:&nbsp;
                    {seasonProgress[show.showId]
                      ? Object.entries(seasonProgress[show.showId]).map(([s, done]) => (
                          <span key={s} className="mr-1">
                            {s} {done ? "✅" : "⬜"}
                          </span>
                        ))
                      : "…"}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteShow(show._id);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-300 transition"
                  >
                    <Trash size={18} />
                  </button>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </section>

      {/* WATCHED */}
      <section>
        <h2 className="text-2xl mt-12 mb-2 text-cyan-200 flex items-center gap-2"><CheckCircle size={24} /> Watched</h2>
        {watchedShows.length === 0 ? (
          <p className="text-gray-500 italic">Niciun serial complet vizionat încă.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {watchedShows.map((show) => (
              <li key={show._id} className="bg-slate-800 p-3 rounded shadow text-sm">
                <img src={show.image} alt={show.title} className="rounded mb-1" />
                <h3 className="text-white font-semibold">{show.title}</h3>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
