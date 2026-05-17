import { HomePage } from "@/components/home-page";
import { getSongs } from "@/lib/data";

export default async function Home() {
  const songs = await getSongs();

  return <HomePage songs={songs} />;
}
