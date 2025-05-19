"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [shows, setShows] = useState([]);
  const [serialeVazute, setSerialeVazute] = useState(0);
  const [episoadeBifate, setEpisoadeBifate] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/shows");
      const data = await res.json();
      setShows(data);

      let countWatched = 0;
let countEpisodes = 0;

for (const show of data) {
  // 1. Numărăm toate episoadele bifate (indiferent de progres)
  countEpisodes += show.episodesWatched?.length || 0;

  // 2. Verificăm dacă toate episoadele sunt bifate → serial complet vizionat
  const resEp = await fetch(`https://api.tvmaze.com/shows/${show.showId}/episodes`);
  const allEp = await resEp.json();
  const allIds = allEp.map((ep) => ep.id);

  const fullyWatched = allIds.every((id) => show.episodesWatched?.includes(id));
  if (fullyWatched) countWatched++;
}


      setSerialeVazute(countWatched);
      setEpisoadeBifate(countEpisodes);
    }

    if (session) {
      load();
    }
  }, [session]);

  if (status === "loading") return <p className="text-white p-8">Se încarcă...</p>;
  if (!session) return <p className="text-white p-8">Trebuie să fii logat pentru a vedea statistici.</p>;

  return (
    <main className="p-8 text-white space-y-6">
      <h1 className="text-3xl font-bold text-cyan-200">📊 Statistici Cont</h1>

      <div className="text-lg">
        <p><strong>Seriale complet vizionate:</strong> {serialeVazute}</p>
        <p><strong>Episoade vizionate:</strong> {episoadeBifate}</p>
      </div>

      <p className="text-gray-400 text-sm">Date actualizate automat în funcție de progresul tău.</p>
    </main>
  );
}
