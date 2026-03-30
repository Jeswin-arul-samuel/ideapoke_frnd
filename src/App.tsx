import { useState } from 'react';
import type { ApiKeys } from './types';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Chat } from './components/Chat';

function App() {
  // Always show modal first on fresh page load — user confirms/changes keys
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);

  function handleSaveKeys(keys: ApiKeys) {
    setApiKeys(keys);
  }

  function handleChangeKeys() {
    setApiKeys(null);
  }

  if (!apiKeys) {
    return <ApiKeyModal onSave={handleSaveKeys} />;
  }

  return <Chat apiKeys={apiKeys} onChangeKeys={handleChangeKeys} />;
}

export default App;
