import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLang } from '../lib/language';

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
  const { lang } = useLang();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [manualQuery, setManualQuery] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Previously hardcoded to 'en-IN' no matter what — a customer who switched
  // the site to Tamil and spoke Tamil into the mic had every word
  // misrecognized as English, which reads as "voice search doesn't work" even
  // though the feature itself was running fine. Chrome's recognizer supports
  // 'ta-IN', so follow the site's selected language instead.
  const recognitionLang = lang === 'ta' ? 'ta-IN' : 'en-IN';
  // If a browser/OS combination doesn't actually have the Tamil speech model
  // installed, it reports 'language-not-supported' instead of transcribing.
  // Fall back to English once rather than dead-ending the customer.
  const triedLangFallbackRef = useRef(false);
  // 'network' is the single most common cause of "Voice recognition failed"
  // even with the mic permission fully granted — Chrome's built-in
  // recognizer calls out to a remote speech service, and that round trip
  // occasionally drops mid-request. Previously any error not explicitly
  // "not-allowed" or "no-speech" showed the same generic failure message
  // and gave up immediately; a transient network hiccup looked identical to
  // a real permission problem. Retrying once automatically fixes the
  // majority of these without the customer having to notice or act.
  const retriedNetworkErrorRef = useRef(false);

  // Was previously duplicated almost verbatim between the auto-start effect
  // below and the mic button's onClick — any error-handling fix only ever
  // applied to whichever copy got edited, leaving the other stale. Now
  // there's exactly one place that creates and wires up a recognition
  // session.
  const startRecognition = (langOverride?: string) => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      setIsListening(false);
      return;
    }

    setIsSupported(true);
    setErrorMsg(null);
    setTranscript('');

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = langOverride || recognitionLang;
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
      const code = event?.error;
      if (code === 'not-allowed' || code === 'permission-denied') {
        setErrorMsg('Microphone access denied. Please allow microphone permission or type your search below.');
      } else if (code === 'no-speech') {
        setErrorMsg("Didn't catch that — try speaking again, or type your search below.");
      } else if (code === 'audio-capture') {
        setErrorMsg("No microphone found. Check your device's mic, or type your search below.");
      } else if (code === 'network') {
        if (!retriedNetworkErrorRef.current) {
          // One silent automatic retry — this is the transient case, most
          // of the time it just works on the second attempt.
          retriedNetworkErrorRef.current = true;
          startRecognition();
          return;
        }
        setErrorMsg("Couldn't reach the voice service — check your connection, or type your search below.");
      } else if (code === 'aborted') {
        // Customer tapped stop or closed the modal mid-listen — not a real error.
        return;
      } else if (code === 'language-not-supported') {
        if (recognition.lang !== 'en-IN' && !triedLangFallbackRef.current) {
          // This device/browser doesn't have the Tamil speech model — fall
          // back to English once instead of leaving the customer stuck.
          triedLangFallbackRef.current = true;
          startRecognition('en-IN');
          return;
        }
        setErrorMsg("Voice search isn't available right now on this device. Please type your search below.");
      } else if (code === 'service-not-allowed') {
        setErrorMsg("Voice search isn't available right now on this device. Please type your search below.");
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
  };

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

    retriedNetworkErrorRef.current = false;
    triedLangFallbackRef.current = false;
    startRecognition();

    return () => {
      recognitionRef.current?.abort();
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
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-sm w-full text-[#0A1F12] p-6 relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-[#0A1F12] cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-base text-[#0A1F12] mb-2">Voice Search</h3>

        {!isSupported ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center text-[#0A1F12] text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-3">
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
                className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-[#0A1F12] focus:outline-none"
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
                  retriedNetworkErrorRef.current = false;
                  triedLangFallbackRef.current = false;
                  startRecognition();
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
              <div className="bg-[#0A1F12] border border-black rounded-xl p-2.5 mb-4 text-[11px] text-white">
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
                className="flex-1 bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-[11px] text-[#0A1F12] focus:outline-none"
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
