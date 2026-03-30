import type { GeneratedIdea } from '../types';

interface IdeaCardProps { idea: GeneratedIdea; index: number; }

export function IdeaCard({ idea, index }: IdeaCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
          {index + 1}
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{idea.title}</h3>
          <p className="mt-1 text-gray-700 leading-relaxed">{idea.explanation}</p>
          {idea.patent_trail.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inspired by:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {idea.patent_trail.map((patent) => (
                  <span key={patent} className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {patent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
