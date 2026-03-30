import type { StatusUpdate } from '../types';

interface AgentStatusProps {
  updates: StatusUpdate[];
}

const AGENTS = [
  { step: 1, name: 'Patent Fetcher', icon: '🔍', description: 'Searching patent databases' },
  { step: 2, name: 'Innovation Extractor', icon: '📄', description: 'Reading and analyzing patents' },
  { step: 3, name: 'Synthesis', icon: '🧩', description: 'Identifying patterns and gaps' },
  { step: 4, name: 'Ideation', icon: '💡', description: 'Generating future innovations' },
];

export function AgentStatus({ updates }: AgentStatusProps) {
  if (updates.length === 0) return null;

  const latestStep = Math.max(...updates.map((u) => u.step || 0));
  const latestMessage = updates[updates.length - 1]?.message || '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-semibold text-gray-700">Agents Working</span>
      </div>

      {/* Pipeline steps */}
      <div className="flex items-center gap-1 mb-4">
        {AGENTS.map((agent, i) => {
          const isDone = latestStep > agent.step;
          const isActive = latestStep === agent.step;

          return (
            <div key={agent.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                    isDone
                      ? 'bg-green-100 scale-100'
                      : isActive
                        ? 'bg-blue-100 scale-110 ring-2 ring-blue-400 ring-offset-2'
                        : 'bg-gray-100 scale-90 opacity-50'
                  }`}
                >
                  {isDone ? '✓' : agent.icon}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium text-center leading-tight ${
                    isDone ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {agent.name}
                </span>
              </div>
              {i < AGENTS.length - 1 && (
                <div
                  className={`h-0.5 w-4 flex-shrink-0 mt-[-14px] transition-colors duration-500 ${
                    isDone ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current status message */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
        <span className="text-sm text-gray-600 truncate">{latestMessage}</span>
      </div>
    </div>
  );
}
