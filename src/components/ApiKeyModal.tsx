import { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  onSave: (keys: { openaiKey?: string; groqKey?: string }) => void;
}

export function ApiKeyModal({ onSave }: ApiKeyModalProps) {
  const [provider, setProvider] = useState<'openai' | 'groq'>('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');

  useEffect(() => {
    // Load saved keys
    const saved = localStorage.getItem('ideapoke_api_keys');
    if (saved) {
      const keys = JSON.parse(saved);
      if (keys.openaiKey) { setOpenaiKey(keys.openaiKey); setProvider('openai'); }
      if (keys.groqKey) { setGroqKey(keys.groqKey); setProvider('groq'); }
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const keys = provider === 'openai'
      ? { openaiKey: openaiKey.trim() }
      : { groqKey: groqKey.trim() };

    localStorage.setItem('ideapoke_api_keys', JSON.stringify(keys));
    onSave(keys);
  }

  const activeKey = provider === 'openai' ? openaiKey : groqKey;
  const isValid = activeKey.trim().length > 10;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to IdeaPoke</h2>
        <p className="text-gray-500 mb-6">
          Enter your API key to get started. Your key is stored locally in your browser and never saved on our servers.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Provider toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setProvider('openai')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                provider === 'openai'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              OpenAI
            </button>
            <button
              type="button"
              onClick={() => setProvider('groq')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                provider === 'groq'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Groq (Free & Fast)
            </button>
          </div>

          {/* Key input */}
          {provider === 'openai' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Models: gpt-4.1-nano (extraction), gpt-4.1-mini (synthesis/ideation)
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Groq API Key
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Models: llama-3.3-70b-versatile (all agents) — blazing fast
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Start Exploring Patents
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Get a free Groq key at <a href="https://console.groq.com" target="_blank" className="underline">console.groq.com</a>
          {' '} or OpenAI key at <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">platform.openai.com</a>
        </p>
      </div>
    </div>
  );
}
