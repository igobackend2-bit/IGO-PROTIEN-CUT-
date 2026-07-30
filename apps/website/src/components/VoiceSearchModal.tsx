import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchQuery: (query: string) => void;
}

// Minimal ambient typing for the Web Speech API (not in default lib.dom.d.ts)
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

const getSpeechRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearchQuery
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [manualQuery, setManualQuery] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      setIsListening(false);
      setTranscript('');
      setErrorMsg(null);
      setManualQuery('');
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();

    if (!SpeechRecognitionCtor) {
      // Browser (e.g. Firefox, some mobile browsers) doesn't support the Web Speech API.
      setIsSupported(false);
      setIsListening(false);
      return;
    }

    setIsSupported(true);
    setErrorMsg(null);
    setTranscript('');

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
        setErrorMsg('Microphone access denied. Please allow microphone permission or type your search below.');
      } else if (event?.error === 'no-speech') {
        setErrorMsg('No speech detected. Try again or type your search below.');
      } else {
        setErrorMsg('Voice recognition failed. Try again or type your search below.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setErrorMsg('Could not start microphone. Try again or type your search below.');
      setIsListening(false);
    }

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmitQuery = (query: string) => {
    if (query.trim()) {
      onSearchQuery(query.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-sm w-full text-[#08120B] p-6 relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-[#08120B] cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-base text-[#08120B] mb-2">Voice Search</h3>

        {!isSupported ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center text-[#08120B] text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Voice search isn't supported in this browser. Type your search instead.</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitQuery(manualQuery);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                autoFocus
                placeholder="e.g. Boneless chicken breast"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-[#08120B] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!manualQuery.trim()}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-600 mb-6">
              {isListening ? 'Listening... Speak your item name' : errorMsg ? 'Voice search paused' : 'Tap the mic to search again'}
            </p>

            {/* Animated Microphone Icon */}
            <button
              onClick={() => {
                if (isListening) {
                  handleStopListening();
                } else {
                  setErrorMsg(null);
                  setTranscript('');
                  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
                  if (SpeechRecognitionCtor) {
                    const recognition = new SpeechRecognitionCtor();
                    recognition.lang = 'en-IN';
                    recognition.continuous = false;
                    recognition.interimResults = true;
                    recognition.onresult = (event) => {
                      let interim = '';
                      let final = '';
                      for (let i = 0; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) final += result[0].transcript;
                        else interim += result[0].transcript;
                      }
                      setTranscript(final || interim);
                    };
                    recognition.onerror = () => {
                      setIsListening(false);
                      setErrorMsg('Voice recognition failed. Try again or type your search below.');
                    };
                    recognition.onend = () => setIsListening(false);
                    recognitionRef.current = recognition;
                    try {
                      recognition.start();
                      setIsListening(true);
                    } catch {
                      setErrorMsg('Could not start microphone.');
                    }
                  }
                }
              }}
              className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center cursor-pointer"
            >
              {isListening && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              )}
              <div className="w-20 h-20 bg-[#0F7B3A] rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
                {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <MicOff className="w-10 h-10" />}
              </div>
            </button>

            {errorMsg && (
              <div className="bg-[#08120B] border border-black rounded-xl p-2.5 mb-4 text-[11px] text-white">
                {errorMsg}
              </div>
            )}

            {transcript && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-xs font-semibold text-emerald-700">
                "{transcript}"
              </div>
            )}

            <button
              onClick={() => handleSubmitQuery(transcript)}
              disabled={isListening || !transcript}
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              {isListening ? 'Listening...' : 'Search Products'}
            </button>

            {/* Manual fallback input, always available */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitQuery(manualQuery);
              }}
              className="flex gap-2 mt-3"
            >
              <input
                type="text"
                placeholder="Or type instead..."
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="flex-1 bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-[11px] text-[#08120B] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!manualQuery.trim()}
                className="bg-emerald-50 border border-emerald-200 hover:border-emerald-400 disabled:opacity-40 text-emerald-700 font-bold px-3 py-2 rounded-xl text-[11px] transition cursor-pointer"
              >
                Go
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
