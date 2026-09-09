import { useCallback, useState } from "react";

/**
 * Stub Expo Go / fallback : la reconnaissance vocale native nécessite
 * un development build (module expo-speech-recognition).
 * Sur web, Metro résout useVoiceSearch.web.js.
 * Sur native (dev client / store), Metro résout useVoiceSearch.native.js.
 */
export function useVoiceSearch() {
  const [error, setError] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const requestStart = useCallback(() => {
    setError("not-supported");
  }, []);

  return {
    isSupported: false,
    isSecureContext: true,
    isListening: false,
    isRequestingPermission: false,
    showPermissionModal,
    interimTranscript: "",
    error,
    requestStart,
    confirmPermissionAndStart: useCallback(() => {
      setShowPermissionModal(false);
      setError("not-supported");
    }, []),
    dismissPermissionModal: useCallback(() => setShowPermissionModal(false), []),
    cancel: useCallback(() => {}, []),
    clearError: useCallback(() => setError(null), []),
    retry: requestStart,
  };
}

export default useVoiceSearch;
