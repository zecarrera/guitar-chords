export type SourceType = "pdf" | "external_link";
export type VideoType = "tutorial" | "song";

export type ChordSection = {
  title: string;
  lines: string[];
};

export type VideoLink = {
  label: string;
  type: VideoType;
  url: string;
};

export type Song = {
  title: string;
  slug: string;
  artist: string;
  genres: string[];
  lists: string[];
  sourceType: SourceType;
  keySignature: string;
  capo: number;
  tuning: string;
  difficulty: string;
  status: "draft" | "published";
  scrollSpeed: number;
  summary: string;
  description: string;
  importNotes: string;
  videoLinks: VideoLink[];
  sections: ChordSection[];
};

export type ArtistSummary = {
  name: string;
  summary: string;
  songCount: number;
  songSlugs: string[];
};

export type GenreSummary = {
  name: string;
  summary: string;
  songCount: number;
};

export type CustomListSummary = {
  name: string;
  summary: string;
  songCount: number;
  songs: string[];
};

export type ImportQueueItem = {
  id: string;
  label: string;
  source: string;
  status: "queued" | "processing" | "ready_for_review";
  summary: string;
};

export type LibraryStat = {
  label: string;
  value: string;
  description: string;
};

export type DataSourceKind = "database" | "demo";
