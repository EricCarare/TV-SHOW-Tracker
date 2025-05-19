"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

export default function SerialPage() {
  const { id: showId } = useParams();

  const [episodes, setEpisodes] = useState([]);
  const [watched, setWatched] = useState([]);
  const [title, setTitle] = useState("");

  
  useEffect(() => {
    async function fetchEpisodes() {
      const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
      const data = await res.json();
      setEpisodes(data);
    }

    fetchEpisodes();
  }, [showId]);

  
  useEffect(() => {
  async function fetchWatched() {
    const res = await fetch(`/api/serial/${showId}`);
    if (res.ok) {
      const data = await res.json();
      setWatched(data.episodesWatched || []);
      setTitle(data.title || ""); // 👈 adăugat
    }
  }

  fetchWatched();
}, [showId]);

  
  const toggleEpisode = async (episodeId) => {
    const updated = watched.includes(episodeId)
      ? watched.filter((id) => id !== episodeId)
      : [...watched, episodeId];

    setWatched(updated);

    await fetch(`/api/serial/${showId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodesWatched: updated }),
    });
  };

  
  const seasons = episodes.reduce((acc, ep) => {
    if (!acc[ep.season]) acc[ep.season] = [];
    acc[ep.season].push(ep);
    return acc;
  }, {});

  return (
    <div className="p-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-amber-200">
        {title || `Serial ID: ${showId}`}
      </h1>
      <p className="text-sm text-gray-400 mb-6">Bifează episoadele vizionate</p>

      {Object.keys(seasons).map((seasonNumber) => (
        <div key={seasonNumber} className="mb-8">
          <h2 className="text-xl text-cyan-200 font-semibold mb-2">Sezon {seasonNumber}</h2>
          <ul className="space-y-1">
            {seasons[seasonNumber].map((ep) => (
              <li
                key={ep.id}
                className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded hover:bg-slate-700 transition"
              >
                <span className="text-sm">
                  Ep {ep.number}: {ep.name}
                </span>
                <input
                  type="checkbox"
                  checked={watched.includes(ep.id)}
                  onChange={() => toggleEpisode(ep.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
