import { LibraryPage } from "@/components/library-page";
import { getManageDashboardData } from "@/lib/admin-data";
import { isDatabaseConfigured } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 text-sm leading-6 text-amber-100">
        The management UI requires a live database connection. Set{" "}
        <code>DATABASE_URL</code>, <code>DIRECT_URL</code>, and{" "}
        <code>ENABLE_DATABASE_READS=true</code> to use CRUD tools.
      </div>
    );
  }

  const { artists, songs } = await getManageDashboardData();

  return <LibraryPage songs={songs} artists={artists} />;
}
