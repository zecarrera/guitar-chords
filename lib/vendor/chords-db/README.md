# Guitar catalog provenance

- Provider: https://github.com/tombatossals/chords-db
- Revision: `df06fa7b425cf5fd29485ff6591236b3557e3fac`
- Asset: `lib/guitar.json` (standard guitar tuning, low E to high E)
- Source: https://raw.githubusercontent.com/tombatossals/chords-db/df06fa7b425cf5fd29485ff6591236b3557e3fac/lib/guitar.json
- SHA-256: `cfe439962b2f444d2c341b1f0261403b4c3a3416e321147286fc608922699974`
- License: MIT; the provider's notice is preserved in `LICENSE` and distributed at `public/chord-data-LICENSE.txt`.
- Contents: 828 chord entries and 3,283 ordered positions.

The JSON is vendored unchanged. Positive frets and barres are relative to
`baseFret`; `-1` means muted and `0` means open. Finger `0` means no fretting
finger; the asset also uses `-1` on muted strings in one F-major position.
`capo` is a barre presentation hint, not the song's capo setting.

## Updating

Choose and review an explicit upstream revision, download its guitar JSON and
license from that revision (including the public license copy), and update the provenance/checksum and expected
counts in the catalog tests. Run the catalog, syntax, formatting, and diagram
tests, then the repository checks. Review changes to first positions carefully:
the application always uses position zero, without ranking or substitutions.
Do not fetch upstream data during builds or application requests.

Structural and pitch checks do not establish comfortable or correct fingerings.
Upstream has known fingering reports and missing chords (including `D7/F#` at
this revision). Missing diagrams remain explicit; there is no legacy fallback,
local correction collection, or custom-shape management.
