import { useCallback, useEffect, useRef, useState } from "react";
import { requireOptionalNativeModule, useEventListener } from "expo";

const LANG_MAP = {
  fr: "fr-FR",
  ar: "ar-DZ",
  en: "en-US",
};

const DEFAULT_LOCALE = "fr-FR";
const SILENCE_TIMEOUT_MS = 6000;

const SpeechModule = requireOptionalNativeModule("ExpoSpeechRecognition");

const NoopModule = {
  addListener() {
    return { remove() {} };
  },
  removeListener() {},
};

const Module = SpeechModule || NoopModule;

function resolveLocale(language) {
  if (!language) return DEFAULT_LOCALE;
  if (LANG_MAP[language]) return LANG_MAP[language];
  const base = String(language).split("-")[0];
  return LANG_MAP[base] || DEFAULT_LOCALE;
}

function mapErrorCode(code) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "not-allowed";
    case "no-speech":
    case "speech-timeout":
      return "no-speech";
    case "audio-capture":
      return "audio-capture";
    case "network":
      return "network";
    case "aborted":
      return "aborted";
    case "language-not-supported":
      return "language-not-supported";
    case "busy":
      return "start-failed";
    default:
      return "generic";
  }
}

/**
 * Recherche vocale native.
 * Expo Go : module absent → isSupported false (pas de crash).
 * Dev client / build store : utilise ExpoSpeechRecognition.
 */
export function useVoiceSearch({ language, onResult, onFinalResult } = {}) {
  const isSupported = Boolean(
    SpeechModule &&
      (typeof SpeechModule.isRecognitionAvailable !== "function" ||
        SpeechModule.isRecognitionAvailable())
  );

  const [isListening, setIsListening] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const cancelledRef = useRef(false);
  const localeRef = useRef(resolveLocale(language));
  const onResultRef = useRef(onResult);
  const onFinalResultRef = useRef(onFinalResult);

  useEffect(() => {
    onResultRef.current = onResult;
    onFinalResultRef.current = onFinalResult;
  }, [onResult, onFinalResult]);

  useEffect(() => {
    localeRef.current = resolveLocale(language);
  }, [language]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      try {
        SpeechModule?.stop?.();
      } catch {
        /* no-op */
      }
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer]);

  useEventListener(Module, "start", () => {
    setIsListening(true);
    setError(null);
    armSilenceTimer();
  });

  useEventListener(Module, "speechstart", () => {
    clearSilenceTimer();
  });

  useEventListener(Module, "speechend", () => {
    try {
      SpeechModule?.stop?.();
    } catch {
      /* no-op */
    }
  });

  useEventListener(Module, "result", (event) => {
    clearSilenceTimer();
    const transcript = event?.results?.[0]?.transcript?.trim() ?? "";
    if (!transcript) return;

    if (event.isFinal) {
      finalTranscriptRef.current = transcript;
      setInterimTranscript("");
      onResultRef.current?.(transcript);
    } else {
      setInterimTranscript(transcript);
      onResultRef.current?.(transcript);
      armSilenceTimer();
    }
  });

  useEventListener(Module, "error", (event) => {
    clearSilenceTimer();
    if (event?.error === "aborted" || cancelledRef.current) return;
    setError(mapErrorCode(event?.error));
    setIsListening(false);
  });

  useEventListener(Module, "end", () => {
    clearSilenceTimer();
    setIsListening(false);
    setInterimTranscript("");

    const finalText = finalTranscriptRef.current.trim();
    finalTranscriptRef.current = "";

    if (!cancelledRef.current && finalText) {
      onFinalResultRef.current?.(finalText);
    }
    cancelledRef.current = false;
  });

  const startRecognition = useCallback(() => {
    if (!isSupported || !SpeechModule) {
      setError("not-supported");
      return;
    }

    setError(null);
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    cancelledRef.current = false;

    try {
      SpeechModule.start({
        lang: localeRef.current,
        interimResults: true,
        continuous: false,
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL: "web_search",
        },
      });
    } catch {
      setError("start-failed");
      setIsListening(false);
    }
  }, [isSupported]);

  const acquireAndStart = useCallback(async () => {
    if (!isSupported || !SpeechModule) {
      setError("not-supported");
      return;
    }

    setIsRequestingPermission(true);
    setError(null);

    try {
      const result = await SpeechModule.requestPermissionsAsync();
      if (!result.granted) {
        setError("not-allowed");
        return;
      }
      setShowPermissionModal(false);
      startRecognition();
    } catch {
      setError("not-allowed");
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isSupported, startRecognition]);

  const requestStart = useCallback(async () => {
    if (isListening || isRequestingPermission) return;

    if (!isSupported) {
      setError("not-supported");
      return;
    }

    setError(null);

    try {
      const current = await SpeechModule.getPermissionsAsync();
      if (current.granted) {
        await acquireAndStart();
        return;
      }
      if (current.canAskAgain === false) {
        setError("not-allowed");
        return;
      }
    } catch {
      /* → modale */
    }

    setShowPermissionModal(true);
  }, [acquireAndStart, isListening, isRequestingPermission, isSupported]);

  const confirmPermissionAndStart = useCallback(async () => {
    setShowPermissionModal(false);
    await acquireAndStart();
  }, [acquireAndStart]);

  const dismissPermissionModal = useCallback(() => {
    setShowPermissionModal(false);
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    finalTranscriptRef.current = "";
    clearSilenceTimer();
    try {
      SpeechModule?.abort?.();
    } catch {
      /* no-op */
    }
    setIsListening(false);
    setInterimTranscript("");
  }, [clearSilenceTimer]);

  const clearError = useCallback(() => setError(null), []);

  const retry = useCallback(async () => {
    clearError();
    await requestStart();
  }, [clearError, requestStart]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearSilenceTimer();
      try {
        SpeechModule?.abort?.();
      } catch {
        /* no-op */
      }
    };
  }, [clearSilenceTimer]);

  return {
    isSupported,
    isSecureContext: true,
    isListening,
    isRequestingPermission,
    showPermissionModal,
    interimTranscript,
    error,
    requestStart,
    confirmPermissionAndStart,
    dismissPermissionModal,
    cancel,
    clearError,
    retry,
  };
}

export default useVoiceSearch;
