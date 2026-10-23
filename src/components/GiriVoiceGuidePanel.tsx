import React, { useEffect, useRef, useState } from 'react';
import {
  VargaChartDefinition,
  generateLocalGiriVoiceScript,
} from '../utils/shastiamshaLogic';

interface GiriVoiceGuidePanelProps {
  vargaChart: VargaChartDefinition;
  selectedHouse: number;
  selectedPlanetSymbol: string | null;
  preferredTechniques: string[];
  onAddNaturalRemedyToTracker?: (title: string, method: string, planet: string) => void;
}

export const GiriVoiceGuidePanel: React.FC<GiriVoiceGuidePanelProps> = ({
  vargaChart,
  selectedHouse,
  selectedPlanetSymbol,
  preferredTechniques,
  onAddNaturalRemedyToTracker,
}) => {
  const localGuidance = generateLocalGiriVoiceScript(
    vargaChart,
    selectedHouse,
    selectedPlanetSymbol,
    preferredTechniques
  );

  const [scriptText, setScriptText] = useState<string>(localGuidance.scriptText);
  const [keyDictum, setKeyDictum] = useState<string>(localGuidance.keyDictum);
  const [naturalRemedy, setNaturalRemedy] = useState<string>(localGuidance.naturalRemedy);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [voiceName, setVoiceName] = useState<string>('Fenrir');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingAiVoice, setIsLoadingAiVoice] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync baseline script whenever chart, house, planet, or preferred techniques change
  useEffect(() => {
    const updated = generateLocalGiriVoiceScript(
      vargaChart,
      selectedHouse,
      selectedPlanetSymbol,
      preferredTechniques
    );
    setScriptText(updated.scriptText);
    setKeyDictum(updated.keyDictum);
    setNaturalRemedy(updated.naturalRemedy);
  }, [vargaChart, selectedHouse, selectedPlanetSymbol, preferredTechniques]);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakWithBrowserFallback = (textToSpeak: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.96;
      utterance.pitch = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleInstantNarrate = () => {
    if (isSpeaking) {
      stopAllAudio();
      return;
    }
    speakWithBrowserFallback(scriptText);
  };

  const handleAskGiriVoiceGuide = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    stopAllAudio();
    setIsLoadingAiVoice(true);
    setStatusMessage('Synthesizing Lunar Astro (Deepanshu Giri) reading & voice audio...');

    try {
      const houseInfo =
        vargaChart.houses.find((h) => h.house === selectedHouse) || vargaChart.houses[0];
      const response = await fetch('/api/astrology/giri-voice-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartName: vargaChart.name,
          lagnaName: vargaChart.lagnaName,
          selectedHouse,
          selectedPlanet: selectedPlanetSymbol || houseInfo.occupants[0] || '',
          houseSummary: `${houseInfo.signName} (#${houseInfo.signNumber}) · ${houseInfo.highlightNote}`,
          preferredTechniques,
          userQuestion: userQuestion.trim(),
          voiceName,
        }),
      });

      if (!response.ok) {
        throw new Error('Voice synthesis fallback triggered');
      }

      const data = await response.json();
      if (data.scriptText) setScriptText(data.scriptText);
      if (data.keyDictum) setKeyDictum(data.keyDictum);
      if (data.naturalRemedy) setNaturalRemedy(data.naturalRemedy);

      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          speakWithBrowserFallback(data.scriptText || scriptText);
        };
        await audio.play();
        setStatusMessage('Playing Gemini 3.8 TTS Voice Guidance');
      } else {
        speakWithBrowserFallback(data.scriptText || scriptText);
        setStatusMessage('Speaking via local voice engine');
      }
    } catch {
      speakWithBrowserFallback(scriptText);
      setStatusMessage('Speaking active Lunar Astro chart narration');
    } finally {
      setIsLoadingAiVoice(false);
      setTimeout(() => setStatusMessage(''), 4500);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-amber-400 font-semibold">
            Lunar Astro Voice Mentor · Deepanshu Giri Methodology
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Interactive Voice Guide ({vargaChart.code} · House {selectedHouse}
            {selectedPlanetSymbol ? ` · ${selectedPlanetSymbol}` : ''})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Select Voice Guide Persona"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono-tabular bg-slate-800 border border-slate-700 rounded text-slate-200"
          >
            <option value="Fenrir">Voice: Fenrir (Deep Mentor)</option>
            <option value="Charon">Voice: Charon (Sage Scholar)</option>
            <option value="Puck">Voice: Puck (Dynamic Analyst)</option>
            <option value="Kore">Voice: Kore (Serene Guide)</option>
          </select>

          <button
            type="button"
            onClick={handleInstantNarrate}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isSpeaking
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {isSpeaking ? '■ Stop Voice' : '▶ Speak House Guide'}
          </button>

          <button
            type="button"
            disabled={isLoadingAiVoice}
            onClick={() => handleAskGiriVoiceGuide()}
            className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isLoadingAiVoice ? 'Generating AI Voice...' : 'Deep Giri AI Audio'}
          </button>
        </div>
      </div>

      {/* Active Techniques Applied */}
      <div className="mb-3 text-[11px] font-mono-tabular text-slate-400">
        <span>Active Techniques: </span>
        <span className="text-sky-300">{preferredTechniques.join(' · ')}</span>
      </div>

      {/* Spoken Script Box */}
      <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-md mb-3">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{scriptText}</p>
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-mono-tabular text-amber-400 font-semibold">Dictum: </span>
            <span className="text-slate-300">{keyDictum}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono-tabular text-emerald-400 font-semibold">
                Natural Remedy:{' '}
              </span>
              <span className="text-slate-300">{naturalRemedy}</span>
            </div>
            {onAddNaturalRemedyToTracker && (
              <button
                type="button"
                onClick={() =>
                  onAddNaturalRemedyToTracker(
                    `H${selectedHouse} ${selectedPlanetSymbol || 'Bhava'} Alignment`,
                    naturalRemedy,
                    selectedPlanetSymbol || 'Me'
                  )
                }
                className="px-2 py-1 text-[11px] font-mono-tabular font-semibold bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded shrink-0 cursor-pointer"
              >
                + Track Daily
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom Question / Wish Input for Giri Voice Guide */}
      <form onSubmit={handleAskGiriVoiceGuide} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Ask Giri Voice Guide about this house, career wish, marriage, or pending karma..."
          aria-label="Ask Giri Voice Guide a specific question"
          className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={isLoadingAiVoice}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded cursor-pointer whitespace-nowrap shrink-0"
        >
          Ask &amp; Speak Prediction
        </button>
      </form>

      {statusMessage && (
        <div className="mt-2 text-[11px] font-mono-tabular text-sky-300">{statusMessage}</div>
      )}
    </div>
  );
};
