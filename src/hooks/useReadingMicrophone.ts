import { useCallback, useEffect, useRef, useState } from 'react';

export type MicPermissionState =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface SpeechTranscriptFrame {
  fullTranscript: string;
  finalTranscript: string;
  interimTranscript: string;
  observedSilenceMs: number;
}

interface BrowserSpeechRecognitionAlternative {
  transcript: string;
  confidence?: number;
}

interface BrowserSpeechRecognitionResult {
  0: BrowserSpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface BrowserSpeechRecognitionEvent {
  resultIndex?: number;
  results: ArrayLike<BrowserSpeechRecognitionResult>;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  onresult: ((ev: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: { error: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionConstructor(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function getAudioContextConstructor(): (new () => AudioContext) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: new () => AudioContext;
    webkitAudioContext?: new () => AudioContext;
  };
  return w.AudioContext || w.webkitAudioContext || null;
}

export interface UseReadingMicrophoneReturn {
  permissionState: MicPermissionState;
  speechApiSupported: boolean;
  micStreamSupported: boolean;
  micActive: boolean;
  isTestingMic: boolean;
  inputLevelPct: number;
  voiceActive: boolean;
  currentSilenceMs: number;
  lastPauseDurationMs: number;
  acousticPauseCount: number;
  interimTranscript: string;
  notice: string | null;
  setNotice: (msg: string | null) => void;
  testMicrophone: (pauseThresholdMs?: number) => Promise<boolean>;
  startCapture: (options: {
    lang?: string;
    pauseThresholdMs?: number;
    onTranscriptFrame: (frame: SpeechTranscriptFrame) => void;
    onFallbackToPacer?: (reason: string) => void;
  }) => Promise<boolean>;
  stopCapture: () => void;
}

export function useReadingMicrophone(): UseReadingMicrophoneReturn {
  const speechApiSupported = Boolean(getSpeechRecognitionConstructor());
  const micStreamSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');

  const [permissionState, setPermissionState] = useState<MicPermissionState>('idle');
  const [micActive, setMicActive] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [inputLevelPct, setInputLevelPct] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);
  const [currentSilenceMs, setCurrentSilenceMs] = useState(0);
  const [lastPauseDurationMs, setLastPauseDurationMs] = useState(0);
  const [acousticPauseCount, setAcousticPauseCount] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterTimerRef = useRef<number | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const shouldRunSpeechRef = useRef(false);
  const restartCountRef = useRef(0);
  const committedSegmentsRef = useRef<string[]>([]);
  const voiceHasSpokenRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const lastCompletedSilenceRef = useRef<number>(0);
  const wasSpeakingRef = useRef(false);

  // Sync passive permission status if Permissions API supports 'microphone'
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((status) => {
        if (cancelled) return;
        if (status.state === 'granted') setPermissionState('granted');
        else if (status.state === 'denied') setPermissionState('denied');
      })
      .catch(() => {
        // Browsers like Safari/Firefox omit 'microphone' from permissions.query
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (meterTimerRef.current !== null) {
      window.clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        try {
          track.stop();
        } catch {
          // ignore track stop error
        }
      }
      streamRef.current = null;
    }
    setInputLevelPct(0);
    setVoiceActive(false);
    setCurrentSilenceMs(0);
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    shouldRunSpeechRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {
        // ignore stop error
      }
      recognitionRef.current = null;
    }
  }, []);

  const stopCapture = useCallback(() => {
    stopSpeechRecognition();
    stopAudioMeter();
    setMicActive(false);
    setIsTestingMic(false);
    setInterimTranscript('');
    voiceHasSpokenRef.current = false;
    silenceStartRef.current = null;
    lastCompletedSilenceRef.current = 0;
    wasSpeakingRef.current = false;
  }, [stopAudioMeter, stopSpeechRecognition]);

  useEffect(() => stopCapture, [stopCapture]);

  const startAcousticMonitor = useCallback(
    (stream: MediaStream, pauseThresholdMs = 700) => {
      const AudioCtx = getAudioContextConstructor();
      if (!AudioCtx) return;

      try {
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
        }
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.25;
        source.connect(analyser);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.fftSize);
        voiceHasSpokenRef.current = false;
        silenceStartRef.current = null;
        lastCompletedSilenceRef.current = 0;
        wasSpeakingRef.current = false;
        setAcousticPauseCount(0);
        setLastPauseDurationMs(0);

        if (meterTimerRef.current !== null) {
          window.clearInterval(meterTimerRef.current);
        }

        const speechOnsetRms = 0.022;
        const silenceFloorRms = 0.015;
        const minPauseToRecordMs = Math.max(420, Math.round(pauseThresholdMs * 0.65));

        meterTimerRef.current = window.setInterval(() => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(buffer);
          let sumSquares = 0;
          for (let i = 0; i < buffer.length; i++) {
            const sample = (buffer[i] - 128) / 128;
            sumSquares += sample * sample;
          }
          const rms = Math.sqrt(sumSquares / buffer.length);
          const pct = Math.min(100, Math.round(rms * 380));
          setInputLevelPct(pct);

          const now = Date.now();
          const isSpeakingNow = wasSpeakingRef.current
            ? rms >= silenceFloorRms
            : rms >= speechOnsetRms;

          if (isSpeakingNow) {
            if (!wasSpeakingRef.current && silenceStartRef.current !== null && voiceHasSpokenRef.current) {
              const completedGap = now - silenceStartRef.current;
              if (completedGap >= minPauseToRecordMs) {
                lastCompletedSilenceRef.current = completedGap;
                setLastPauseDurationMs(completedGap);
                setAcousticPauseCount((c) => c + 1);
              }
            }
            voiceHasSpokenRef.current = true;
            wasSpeakingRef.current = true;
            silenceStartRef.current = null;
            setVoiceActive(true);
            setCurrentSilenceMs(0);
          } else {
            wasSpeakingRef.current = false;
            setVoiceActive(false);
            if (voiceHasSpokenRef.current) {
              if (silenceStartRef.current === null) {
                silenceStartRef.current = now;
              }
              setCurrentSilenceMs(now - silenceStartRef.current);
            }
          }
        }, 60);
      } catch {
        // AudioContext blocked or unsupported; SpeechRecognition can still operate
      }
    },
    [],
  );

  const ensureMicPermissionAndStream = useCallback(
    async (pauseThresholdMs = 700): Promise<MediaStream | null> => {
      if (!micStreamSupported) {
        setPermissionState('unavailable');
        setNotice(
          'Browser MediaDevices microphone API is unavailable in this context. Use Interactive Word Pacer below.',
        );
        return null;
      }

      if (
        streamRef.current &&
        streamRef.current.getAudioTracks().some((t) => t.readyState === 'live')
      ) {
        setPermissionState('granted');
        startAcousticMonitor(streamRef.current, pauseThresholdMs);
        return streamRef.current;
      }

      setPermissionState('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        streamRef.current = stream;
        setPermissionState('granted');
        startAcousticMonitor(stream, pauseThresholdMs);
        return stream;
      } catch (err) {
        const domErr = err as { name?: string; message?: string };
        const name = domErr?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
          setPermissionState('denied');
          setNotice(
            'Microphone access was denied. Allow mic permission in browser site settings and retry, or continue seamlessly with Interactive Word Pacer.',
          );
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setPermissionState('unavailable');
          setNotice(
            'No working microphone was detected on this device. Switch to Interactive Word Pacer or connect a headset mic.',
          );
        } else {
          setPermissionState('error');
          setNotice(
            `Could not open microphone (${domErr?.message || name || 'device error'}). Continue using Interactive Word Pacer below.`,
          );
        }
        return null;
      }
    },
    [micStreamSupported, startAcousticMonitor],
  );

  const testMicrophone = useCallback(
    async (pauseThresholdMs = 700): Promise<boolean> => {
      if (isTestingMic) {
        stopCapture();
        setNotice(null);
        return false;
      }
      stopSpeechRecognition();
      const stream = await ensureMicPermissionAndStream(pauseThresholdMs);
      if (!stream) return false;
      setIsTestingMic(true);
      setNotice('Microphone check active — speak a sentence aloud to verify your input level meter.');
      return true;
    },
    [ensureMicPermissionAndStream, isTestingMic, stopCapture, stopSpeechRecognition],
  );

  const startCapture = useCallback(
    async (options: {
      lang?: string;
      pauseThresholdMs?: number;
      onTranscriptFrame: (frame: SpeechTranscriptFrame) => void;
      onFallbackToPacer?: (reason: string) => void;
    }): Promise<boolean> => {
      const { lang = 'en-IN', pauseThresholdMs = 700, onTranscriptFrame, onFallbackToPacer } = options;

      stopSpeechRecognition();
      setIsTestingMic(false);
      committedSegmentsRef.current = [];
      setInterimTranscript('');
      restartCountRef.current = 0;

      const SpeechRec = getSpeechRecognitionConstructor();
      if (!SpeechRec) {
        const msg =
          'Browser SpeechRecognition unavailable here — using Live Interactive Word Pacer (tap words or press Space / Complete Chunk as student reads).';
        setNotice(msg);
        onFallbackToPacer?.(msg);
        return false;
      }

      const stream = await ensureMicPermissionAndStream(pauseThresholdMs);
      if (!stream) {
        onFallbackToPacer?.('Microphone permission or hardware unavailable.');
        return false;
      }

      shouldRunSpeechRef.current = true;

      const bootRecognitionInstance = () => {
        if (!shouldRunSpeechRef.current) return;
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = lang;
          rec.maxAlternatives = 1;

          const baseOffset = committedSegmentsRef.current.length;

          rec.onresult = (event) => {
            restartCountRef.current = 0;
            const latestFinalParts: string[] = [];
            const interimParts: string[] = [];

            const startIdx = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              const piece = (result[0]?.transcript || '').trim();
              if (!piece) continue;
              if (result.isFinal) {
                if (i >= startIdx) {
                  committedSegmentsRef.current[baseOffset + i] = piece;
                }
                latestFinalParts[i] = piece;
              } else {
                interimParts.push(piece);
              }
            }

            // Ensure indices from current session instance stay ordered even if resultIndex skipped
            for (let i = 0; i < latestFinalParts.length; i++) {
              if (latestFinalParts[i]) {
                committedSegmentsRef.current[baseOffset + i] = latestFinalParts[i];
              }
            }

            const finalTranscript = committedSegmentsRef.current.filter(Boolean).join(' ').trim();
            const interim = interimParts.join(' ').trim();
            const fullTranscript = [finalTranscript, interim].filter(Boolean).join(' ').trim();
            setInterimTranscript(interim);

            const observedSilenceMs =
              lastCompletedSilenceRef.current > 0
                ? lastCompletedSilenceRef.current
                : silenceStartRef.current !== null && voiceHasSpokenRef.current
                  ? Date.now() - silenceStartRef.current
                  : 0;
            // Consume completed silence window once words resume
            lastCompletedSilenceRef.current = 0;

            onTranscriptFrame({
              fullTranscript,
              finalTranscript,
              interimTranscript: interim,
              observedSilenceMs,
            });
          };

          rec.onerror = (ev) => {
            if (ev.error === 'no-speech' && shouldRunSpeechRef.current && restartCountRef.current < 6) {
              restartCountRef.current += 1;
              setNotice('Listening across breath pause — speak the next phrase aloud.');
              return;
            }
            if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
              setPermissionState('denied');
            }
            shouldRunSpeechRef.current = false;
            setMicActive(false);
            const reason = `Microphone capture paused (${ev.error}). Continue seamlessly using the Interactive Word Pacer below.`;
            setNotice(reason);
            onFallbackToPacer?.(reason);
          };

          rec.onend = () => {
            if (shouldRunSpeechRef.current && restartCountRef.current < 6) {
              restartCountRef.current += 1;
              window.setTimeout(() => {
                if (shouldRunSpeechRef.current) bootRecognitionInstance();
              }, 120);
              return;
            }
            setMicActive(false);
          };

          rec.start();
          recognitionRef.current = rec;
          setMicActive(true);
          setNotice(
            'Live Microphone & Acoustic Pause Monitor active (en-IN): read aloud naturally, pausing briefly at commas and full stops.',
          );
        } catch {
          shouldRunSpeechRef.current = false;
          setMicActive(false);
          const msg =
            'Speech-to-text could not initialize — switched to Interactive Word Pacer mode.';
          setNotice(msg);
          onFallbackToPacer?.(msg);
        }
      };

      bootRecognitionInstance();
      return true;
    },
    [ensureMicPermissionAndStream, stopSpeechRecognition],
  );

  return {
    permissionState,
    speechApiSupported,
    micStreamSupported,
    micActive,
    isTestingMic,
    inputLevelPct,
    voiceActive,
    currentSilenceMs,
    lastPauseDurationMs,
    acousticPauseCount,
    interimTranscript,
    notice,
    setNotice,
    testMicrophone,
    startCapture,
    stopCapture,
  };
}
