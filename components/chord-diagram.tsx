import { getChordShape } from "@/lib/chord-library";
import type { ChordPosition } from "@/lib/types";

const strings = ["E", "A", "D", "G", "B", "e"];
const gridLeft = 34;
const gridTop = 44;
const stringSpacing = 30;
const fretSpacing = 24;

export function ChordDiagramSvg({ name, position }: { name: string; position: ChordPosition }) {
  const fretCount = Math.max(4, ...position.frets);
  const barres = position.barres.flatMap((fret) => {
    const endpoints = position.frets.flatMap((value, index) => value === fret ? [index] : []);
    if (endpoints.length < 2) return [];
    const start = endpoints[0];
    const end = endpoints[endpoints.length - 1];
    return [{ fret, start, end }];
  });

  return (
    <svg viewBox="0 0 230 155" role="img" aria-label={`${name} chord diagram`} className="h-auto w-full">
      {strings.map((string, index) => (
        <g key={string}>
          <text x={gridLeft + index * stringSpacing} y={12} textAnchor="middle" className="fill-slate-400 text-[10px] font-semibold">{string}</text>
          <line x1={gridLeft + index * stringSpacing} x2={gridLeft + index * stringSpacing} y1={gridTop} y2={gridTop + fretCount * fretSpacing} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        </g>
      ))}
      {Array.from({ length: fretCount + 1 }, (_, index) => (
        <line key={index} x1={gridLeft} x2={gridLeft + 5 * stringSpacing} y1={gridTop + index * fretSpacing} y2={gridTop + index * fretSpacing} stroke="rgba(255,255,255,0.18)" strokeWidth={position.baseFret === 1 && index === 0 ? 3 : 1.5} />
      ))}
      {Array.from({ length: fretCount }, (_, index) => (
        <text key={index} x={10} y={gridTop + (index + 0.5) * fretSpacing + 4} className="fill-slate-500 text-[10px] font-semibold">{position.baseFret + index}</text>
      ))}
      {barres.map(({ fret, start, end }) => (
        <line
          key={fret}
          data-barre-fret={fret}
          x1={gridLeft + start * stringSpacing}
          x2={gridLeft + end * stringSpacing}
          y1={gridTop + (fret - 0.5) * fretSpacing}
          y2={gridTop + (fret - 0.5) * fretSpacing}
          stroke="rgba(251,191,36,0.7)"
          strokeWidth={18}
          strokeLinecap="round"
        />
      ))}
      {position.frets.map((fret, index) => {
        const x = gridLeft + index * stringSpacing;
        if (fret === -1) {
          return <text key={index} x={x} y={24} textAnchor="middle" className="fill-rose-300 text-[12px] font-semibold">x</text>;
        }
        if (fret === 0) {
          return <circle key={index} cx={x} cy={22} r={6} fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth="2" />;
        }
        const y = gridTop + (fret - 0.5) * fretSpacing;
        const finger = position.fingers[index];
        return (
          <g key={index} data-string={index} data-fret={fret}>
            <circle cx={x} cy={y} r={9} fill="rgba(251,191,36,0.95)" />
            {finger > 0 ? <text x={x} y={y + 3} textAnchor="middle" className="fill-slate-950 text-[10px] font-bold">{finger}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}

export function ChordDiagram({ chordName }: { chordName: string }) {
  const position = getChordShape(chordName);
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold text-white">{chordName}</p>
        {position && position.baseFret > 1 ? (
          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-200">Fret {position.baseFret}</span>
        ) : null}
      </div>
      {position ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <ChordDiagramSvg name={chordName} position={position} />
        </div>
      ) : (
        <p className="mt-2 text-xs leading-5 text-slate-300">No diagram available for {chordName} in the chord catalog.</p>
      )}
    </div>
  );
}
