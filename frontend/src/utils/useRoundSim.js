import { useRef, useCallback, useState } from "react";

export function useRoundTimer(onNextRound, interval = 20000) {
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setTimer(0);

    // Elke seconde timer ophogen
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    // Elke interval een nieuwe ronde
    intervalRef.current = setInterval(() => {
      onNextRound();
      setTimer(0);
    }, interval);
  }, [isRunning, interval, onNextRound]);

  const stop = useCallback(() => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  }, []);

  const restart = useCallback(() => {
    stop();
    setTimer(0);
    setTimeout(start, 100);
  }, [start, stop]);

  return { isRunning, timer, start, stop, restart };
}