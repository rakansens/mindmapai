import React, { useState, useEffect } from 'react';
import { KeyRound, Save, Check } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (apiKey: string) => void;
}

export function ApiKeyInput({ onSave }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      onSave(savedKey);
      setIsSaved(true);
    }
  }, [onSave]);

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      setIsValidating(true);
      const isValid = await validateApiKey(apiKey);
      setIsValidating(false);

      if (isValid) {
        onSave(apiKey);
        localStorage.setItem('openai_api_key', apiKey);
        setIsSaved(true);
        setTimeout(() => setIsVisible(false), 1500);
      } else {
        alert('Invalid API key. Please check and try again.');
      }
    } else {
      alert('Please enter a valid OpenAI API key starting with "sk-"');
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-full shadow-lg transition-colors ${
          isSaved 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white tooltip`}
        title={isSaved ? 'API Key Saved' : 'Set API Key'}
      >
        {isSaved ? <Check size={20} /> : <KeyRound size={20} />}
      </button>

      {isVisible && (
        <div className="absolute left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-80">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                OpenAI API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isValidating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Key</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}