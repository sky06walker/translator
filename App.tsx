import React, { useState, useCallback } from 'react';
import { dictionaryLookup, textToSpeech } from './services/geminiService';
import type { TranslationResult } from './types';
import { decode, decodeAudioData } from './utils/audio';
import { SearchIcon } from './components/icons/SearchIcon';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import { ResultCard } from './components/ResultCard';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const audioContextRef = React.useRef<AudioContext | null>(null);

  const handleSearch = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      setError('Please enter a word to translate.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setTranslationResult(null);

    try {
      const result = await dictionaryLookup(query);
      setTranslationResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to get translation. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handlePlayAudio = useCallback(async (text: string, language: string) => {
    if (playingAudio === `${text}-${language}`) return;

    setPlayingAudio(`${text}-${language}`);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      const base64Audio = await textToSpeech(text);
      
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContext,
          24000,
          1,
        );
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => {
            setPlayingAudio(null);
        };
      } else {
        throw new Error('Received empty audio data.');
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError('Sorry, could not play audio for this word.');
      setPlayingAudio(null);
    }
  }, [playingAudio]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Gemini Multilingual Kamus
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Instant, accurate translations between English, Malay, and Chinese.
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transition-shadow duration-300">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a word..."
              className="w-full px-5 py-3 text-lg bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              className="px-5 py-3 bg-primary hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <SearchIcon />
              )}
            </button>
          </form>
        </div>

        <div className="max-w-2xl mx-auto mt-8">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {translationResult && (
            <div className="space-y-6 animate-fade-in">
              {translationResult.translations.map((trans, index) => (
                <ResultCard 
                    key={index} 
                    translation={trans}
                    onPlayAudio={() => handlePlayAudio(trans.word, trans.language)}
                    isPlaying={playingAudio === `${trans.word}-${trans.language}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
       <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
            <p>Powered by Google Gemini. Built with React & Tailwind CSS.</p>
        </footer>
    </div>
  );
};

export default App;
