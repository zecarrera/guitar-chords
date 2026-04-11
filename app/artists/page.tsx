import { ArtistList } from "@/components/artist-list";
import { getArtists } from "@/lib/data";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Artists
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Group songs by who you play most
        </h1>
      </section>

      <ArtistList artists={artists} />
    </div>
  );
}
