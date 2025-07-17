interface StatsProps {
  emDashes: number;
  cliches: number;
  jargon: number;
  aiTells: number;
  readabilityScore: number | null;
  complexWords: number;
  longSentences: number;
  remainingRuns?: number | null;
}

export default function Stats({ emDashes, cliches, jargon, aiTells, readabilityScore, complexWords, longSentences, remainingRuns }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-8 gap-4 text-center">
      <div className="bg-teal-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{emDashes}</p>
        <p className="text-sm">Em-Dashes</p>
      </div>
      <div className="bg-purple-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{cliches}</p>
        <p className="text-sm">Cliches</p>
      </div>
      <div className="bg-yellow-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{jargon}</p>
        <p className="text-sm">Jargon</p>
      </div>
      <div className="bg-pink-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{aiTells}</p>
        <p className="text-sm">AI Tells</p>
      </div>
      <div className="bg-orange-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{complexWords}</p>
        <p className="text-sm">Complex Words</p>
      </div>
      <div className="bg-red-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{longSentences}</p>
        <p className="text-sm">Long Sentences</p>
      </div>
      <div className="bg-blue-500/20 p-4 rounded-lg">
        <p className="text-2xl font-bold">{readabilityScore ? readabilityScore.toFixed(1) : 'N/A'}</p>
        <p className="text-sm">Readability</p>
      </div>
      {remainingRuns !== null && (
        <div className="bg-green-500/20 p-4 rounded-lg">
          <p className="text-2xl font-bold">{remainingRuns}</p>
          <p className="text-sm">Free Runs Left</p>
        </div>
      )}
    </div>
  );
}
