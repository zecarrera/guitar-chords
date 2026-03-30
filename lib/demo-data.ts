import type {
  ArtistSummary,
  CustomListSummary,
  GenreSummary,
  ImportQueueItem,
  Song,
} from "@/lib/types";

export const songs: Song[] = [
  {
    title: "Sunday Harbor",
    slug: "sunday-harbor",
    artist: "The Harbor Lights",
    createdAt: "2026-03-10T09:00:00.000Z",
    genres: ["Acoustic", "Indie Folk"],
    lists: ["Warm-up Set", "Sunday Service"],
    sourceType: "pdf",
    keySignature: "G major",
    capo: 2,
    tuning: "Standard",
    difficulty: "Intermediate",
    status: "published",
    scrollSpeed: 24,
    importNotes:
      "Imported from a clean PDF and edited to preserve section markers before publishing.",
    updatedAt: "2026-03-12T10:15:00.000Z",
    videoLinks: [
      {
        label: "Fingerstyle walkthrough",
        type: "tutorial",
        url: "https://example.com/tutorials/sunday-harbor",
      },
      {
        label: "Reference performance",
        type: "song",
        url: "https://example.com/songs/sunday-harbor",
      },
    ],
    sections: [
      {
        title: "Verse",
        lines: [
          "[G] Harbor lights are [D] drifting slow",
          "[Em] Gentle waves keep [C] steady time",
          "[G] Hold the pulse and [D] let it ring",
          "[C] Breathe and settle [D] into the line",
        ],
      },
      {
        title: "Chorus",
        lines: [
          "[C] Raise the sail and [G] keep it light",
          "[D] Every change should [Em] feel the same",
          "[C] Let the rhythm [G] carry you",
          "[D] Back to where the [G] harbor came",
        ],
      },
      {
        title: "Bridge",
        lines: [
          "N.C. Palm mute the bass notes for two bars",
          "[Em] Add light strums on beats [C] two and four",
          "[G] Return to open voicings [D] for the final chorus",
        ],
      },
    ],
  },
  {
    title: "Midnight Lantern",
    slug: "midnight-lantern",
    artist: "Northline Avenue",
    createdAt: "2026-03-14T18:30:00.000Z",
    genres: ["Alternative", "Pop Rock"],
    lists: ["Open Mic", "Late Night Set"],
    sourceType: "external_link",
    keySignature: "D major",
    capo: 0,
    tuning: "Drop D",
    difficulty: "Advanced",
    status: "published",
    scrollSpeed: 30,
    importNotes:
      "Canonical link was imported first, then the bridge and ending tags were normalized during review.",
    updatedAt: "2026-03-16T11:00:00.000Z",
    videoLinks: [
      {
        label: "Lead guitar tutorial",
        type: "tutorial",
        url: "https://example.com/tutorials/midnight-lantern",
      },
      {
        label: "Live arrangement reference",
        type: "song",
        url: "https://example.com/songs/midnight-lantern",
      },
    ],
    sections: [
      {
        title: "Intro riff",
        lines: [
          "D5  D5/F#  G5  A5",
          "Let the low string ring while the top notes stay tight",
          "Repeat 2x before the verse enters",
        ],
      },
      {
        title: "Verse",
        lines: [
          "[D] Hold the lantern [G] to the rain",
          "[Bm] Count the echoes [A] in the lane",
          "[D] Keep the groove dry [G] and controlled",
          "[Em] Open up the [A] last refrain",
        ],
      },
      {
        title: "Hook",
        lines: [
          "[G] Turn it over [D] one more time",
          "[A] Let the chorus [Bm] climb the line",
          "[G] Strong downstrokes and [D] steady air",
          "[Em] Land the ending [A] clean and bright",
        ],
      },
    ],
  },
  {
    title: "Open Highway",
    slug: "open-highway",
    artist: "Cedar Run",
    createdAt: "2026-03-18T07:45:00.000Z",
    genres: ["Country", "Acoustic"],
    lists: ["Road Trip", "Easy Requests"],
    sourceType: "pdf",
    keySignature: "A major",
    capo: 1,
    tuning: "Standard",
    difficulty: "Beginner",
    status: "draft",
    scrollSpeed: 18,
    importNotes:
      "PDF import detected repeated chorus markers; review still needed before publish.",
    updatedAt: "2026-03-19T08:20:00.000Z",
    videoLinks: [
      {
        label: "Strumming pattern lesson",
        type: "tutorial",
        url: "https://example.com/tutorials/open-highway",
      },
    ],
    sections: [
      {
        title: "Verse",
        lines: [
          "[A] Roll the tires [E] past the pines",
          "[F#m] Keep the rhythm [D] soft and wide",
          "[A] Let the vocal [E] lead the way",
          "[D] Save the fill for [E] after line two",
        ],
      },
      {
        title: "Chorus",
        lines: [
          "[D] Open highway [A] carry on",
          "[E] Simple changes [F#m] keep it strong",
          "[D] Stay on top of [A] every turn",
          "[E] Bring it home with [A] one last song",
        ],
      },
    ],
  },
];

export const stats = [
  {
    label: "Songs in library",
    value: String(songs.length),
    description: "Published and draft entries ready for organization.",
  },
  {
    label: "Artists tracked",
    value: "3",
    description: "Separate artist records keep browsing and filtering clean.",
  },
  {
    label: "Custom lists",
    value: "6",
    description: "Lists support rehearsal sets, events, and personal practice.",
  },
  {
    label: "Pending imports",
    value: "2",
    description: "Draft ingest jobs waiting for review before publishing.",
  },
];

export const artists: ArtistSummary[] = [
  {
    name: "The Harbor Lights",
    summary:
      "Gentle acoustic arrangements with steady rhythms suited for warm-up sets.",
    songCount: 1,
    songSlugs: ["sunday-harbor"],
  },
  {
    name: "Northline Avenue",
    summary:
      "Alternative rock material where lead guitar tutorials matter as much as the base chord sheet.",
    songCount: 1,
    songSlugs: ["midnight-lantern"],
  },
  {
    name: "Cedar Run",
    summary:
      "Straightforward country-style songs that are easy to test during import review.",
    songCount: 1,
    songSlugs: ["open-highway"],
  },
];

export const genres: GenreSummary[] = [
  {
    name: "Acoustic",
    summary: "Useful for calmer sets, fingerstyle practice, and sing-along prep.",
    songCount: 2,
  },
  {
    name: "Indie Folk",
    summary: "Home for lighter textures, open voicings, and dynamic arrangement notes.",
    songCount: 1,
  },
  {
    name: "Alternative",
    summary: "Keeps more rhythm-driven or electric-focused songs grouped together.",
    songCount: 1,
  },
  {
    name: "Country",
    summary: "Helpful for quick-request lists and simple progression practice.",
    songCount: 1,
  },
];

export const customLists: CustomListSummary[] = [
  {
    name: "Warm-up Set",
    summary: "Songs with a relaxed pace that help settle into rehearsal.",
    songCount: 1,
    songs: ["Sunday Harbor"],
  },
  {
    name: "Sunday Service",
    summary: "Organized for acoustic-led sets with smooth transitions.",
    songCount: 1,
    songs: ["Sunday Harbor"],
  },
  {
    name: "Open Mic",
    summary: "Performance-ready songs where arrangement details matter.",
    songCount: 1,
    songs: ["Midnight Lantern"],
  },
  {
    name: "Late Night Set",
    summary: "Higher-energy tracks with stronger hooks and denser rhythm parts.",
    songCount: 1,
    songs: ["Midnight Lantern"],
  },
  {
    name: "Road Trip",
    summary: "Simple, upbeat songs that work well in casual settings.",
    songCount: 1,
    songs: ["Open Highway"],
  },
  {
    name: "Easy Requests",
    summary: "Beginner-friendly options for quick pull-up sessions.",
    songCount: 1,
    songs: ["Open Highway"],
  },
];

export const importQueue: ImportQueueItem[] = [
  {
    id: "import-1",
    label: "Open Highway PDF",
    source: "Uploaded chord sheet",
    status: "ready_for_review",
    summary:
      "Sections were extracted successfully, but duplicate chorus markers still need cleanup.",
  },
  {
    id: "import-2",
    label: "Midnight Lantern source page",
    source: "Canonical external link",
    status: "processing",
    summary:
      "Source metadata is available; final review should confirm that bridge formatting survives normalization.",
  },
  {
    id: "import-3",
    label: "New acoustic single",
    source: "Uploaded chord sheet",
    status: "queued",
    summary:
      "Waiting for ingestion to create a draft document and candidate tags.",
  },
];

export function getSongBySlug(slug: string) {
  return songs.find((song) => song.slug === slug);
}
