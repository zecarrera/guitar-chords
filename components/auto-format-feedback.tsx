import type { AutoFormatResult } from "@/lib/auto-format";

type AutoFormatFeedbackProps = {
  result: AutoFormatResult;
};

export function AutoFormatFeedback({ result }: AutoFormatFeedbackProps) {
  const warnings = result.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  );
  const recognizedCount =
    result.recognizedPairs.length +
    result.instrumentalRows.length +
    result.inlineLines.length;

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs leading-5 ${
        warnings.length > 0
          ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
      }`}
      role="status"
    >
      <p className="font-semibold">
        {warnings.length > 0
          ? `${warnings.length} row${warnings.length === 1 ? " needs" : "s need"} review`
          : `Analysis complete: ${recognizedCount} chord structure${recognizedCount === 1 ? "" : "s"} recognized`}
      </p>

      <p className="mt-1 text-slate-300">
        {result.recognizedPairs.length} paired,{" "}
        {result.instrumentalRows.length} instrumental,{" "}
        {result.inlineLines.length} inline.
      </p>

      {warnings.length > 0 ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {warnings.map((warning) => (
            <li key={`${warning.line}-${warning.code}`}>
              Line {warning.line}: {warning.message}
            </li>
          ))}
        </ul>
      ) : null}

      {result.missingDiagrams.length > 0 ? (
        <p className="mt-1 text-slate-300">
          No diagram available for{" "}
          {Array.from(
            new Set(result.missingDiagrams.map(({ name }) => name)),
          ).join(", ")}
          . These chords remain playable.
        </p>
      ) : null}
    </div>
  );
}
