-- CreateTable
CREATE TABLE "ChordDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frets" TEXT[] NOT NULL,
    "fingers" INTEGER[] NOT NULL,
    "baseFret" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChordDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChordDefinition_name_key" ON "ChordDefinition"("name");

-- Seed default chord definitions
INSERT INTO "ChordDefinition" ("id", "name", "frets", "fingers", "baseFret", "createdAt", "updatedAt") VALUES
('seed-chord-a', 'A', ARRAY['x', '0', '2', '2', '2', '0'], ARRAY[0, 0, 1, 2, 3, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-a7', 'A7', ARRAY['x', '0', '2', '0', '2', '0'], ARRAY[0, 0, 2, 0, 3, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-am', 'Am', ARRAY['x', '0', '2', '2', '1', '0'], ARRAY[0, 0, 2, 3, 1, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-b', 'B', ARRAY['x', '2', '4', '4', '4', '2'], ARRAY[0, 1, 3, 4, 4, 1], 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-b7', 'B7', ARRAY['x', '2', '1', '2', '0', '2'], ARRAY[0, 2, 1, 3, 0, 4], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-bb', 'Bb', ARRAY['x', '1', '3', '3', '3', '1'], ARRAY[0, 1, 3, 4, 4, 1], 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-bm', 'Bm', ARRAY['x', '2', '4', '4', '3', '2'], ARRAY[0, 1, 3, 4, 2, 1], 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-c', 'C', ARRAY['x', '3', '2', '0', '1', '0'], ARRAY[0, 3, 2, 0, 1, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-c7', 'C7', ARRAY['x', '3', '2', '3', '1', '0'], ARRAY[0, 3, 2, 4, 1, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-cm', 'Cm', ARRAY['x', '3', '5', '5', '4', '3'], ARRAY[0, 1, 3, 4, 2, 1], 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-d', 'D', ARRAY['x', 'x', '0', '2', '3', '2'], ARRAY[0, 0, 0, 1, 3, 2], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-d7', 'D7', ARRAY['x', 'x', '0', '2', '1', '2'], ARRAY[0, 0, 0, 2, 1, 3], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-dm', 'Dm', ARRAY['x', 'x', '0', '2', '3', '1'], ARRAY[0, 0, 0, 2, 3, 1], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-e', 'E', ARRAY['0', '2', '2', '1', '0', '0'], ARRAY[0, 2, 3, 1, 0, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-e7', 'E7', ARRAY['0', '2', '0', '1', '0', '0'], ARRAY[0, 2, 0, 1, 0, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-em', 'Em', ARRAY['0', '2', '2', '0', '0', '0'], ARRAY[0, 2, 3, 0, 0, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-f', 'F', ARRAY['1', '3', '3', '2', '1', '1'], ARRAY[1, 3, 4, 2, 1, 1], 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-fm', 'Fm', ARRAY['1', '3', '3', '1', '1', '1'], ARRAY[1, 3, 4, 1, 1, 1], 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-fsharp', 'F#', ARRAY['2', '4', '4', '3', '2', '2'], ARRAY[1, 3, 4, 2, 1, 1], 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-fsharpm', 'F#m', ARRAY['2', '4', '4', '2', '2', '2'], ARRAY[1, 3, 4, 1, 1, 1], 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-g', 'G', ARRAY['3', '2', '0', '0', '0', '3'], ARRAY[2, 1, 0, 0, 0, 3], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-g7', 'G7', ARRAY['3', '2', '0', '0', '0', '1'], ARRAY[3, 2, 0, 0, 0, 1], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-amaj7', 'Amaj7', ARRAY['x', '0', '2', '1', '2', '0'], ARRAY[0, 0, 2, 1, 3, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-asus2', 'Asus2', ARRAY['x', '0', '2', '2', '0', '0'], ARRAY[0, 0, 2, 3, 0, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-asus4', 'Asus4', ARRAY['x', '0', '2', '2', '3', '0'], ARRAY[0, 0, 1, 2, 3, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-cadd9', 'Cadd9', ARRAY['x', '3', '2', '0', '3', '3'], ARRAY[0, 3, 2, 0, 4, 4], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-dsus2', 'Dsus2', ARRAY['x', 'x', '0', '2', '3', '0'], ARRAY[0, 0, 0, 1, 2, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-dsus4', 'Dsus4', ARRAY['x', 'x', '0', '2', '3', '3'], ARRAY[0, 0, 0, 1, 2, 3], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-emaj7', 'Emaj7', ARRAY['0', '2', '1', '1', '0', '0'], ARRAY[0, 3, 1, 2, 0, 0], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-chord-gsus2', 'Gsus2', ARRAY['3', '0', '0', '2', '3', '3'], ARRAY[2, 0, 0, 1, 3, 4], NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
