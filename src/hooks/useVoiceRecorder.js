import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

/**
 * Enregistrement micro (expo-av) pour notes vocales chat.
 */
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState("");
  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(async () => {
    clearTimer();
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (rec) {
      try {
        const status = await rec.getStatusAsync();
        if (status.isRecording) {
          await rec.stopAndUnloadAsync();
        } else {
          await rec.unloadAsync();
        }
      } catch {
        // ignore
      }
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch {
      // ignore
    }
  }, [clearTimer]);

  useEffect(() => () => {
    cleanup();
  }, [cleanup]);

  const start = useCallback(async () => {
    setError("");
    if (recordingRef.current) return { ok: false, error: "busy" };

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError("not-allowed");
        return { ok: false, error: "not-allowed" };
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      clearTimer();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
      setIsRecording(true);
      return { ok: true };
    } catch {
      await cleanup();
      setIsRecording(false);
      setError("start-failed");
      return { ok: false, error: "start-failed" };
    }
  }, [cleanup, clearTimer]);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      return null;
    }

    try {
      clearTimer();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      } catch {
        // ignore
      }

      if (!uri) return null;

      // HIGH_QUALITY → AAC/M4A (accepté par le backend)
      return {
        uri,
        mimeType: "audio/mp4",
        fileName: `voix-${Date.now()}.m4a`,
      };
    } catch {
      await cleanup();
      setIsRecording(false);
      setError("stop-failed");
      return null;
    }
  }, [cleanup, clearTimer]);

  const cancel = useCallback(async () => {
    await cleanup();
    setIsRecording(false);
    setElapsedMs(0);
  }, [cleanup]);

  return {
    isRecording,
    elapsedMs,
    error,
    start,
    stop,
    cancel,
    clearError: () => setError(""),
  };
}

export function formatRecordingDuration(ms) {
  const totalSec = Math.max(0, Math.floor(Number(ms) / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}
