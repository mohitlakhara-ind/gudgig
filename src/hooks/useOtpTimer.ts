import { useCallback, useEffect, useRef, useState } from 'react';

export function useOtpTimer(initialExpirySeconds: number = 600, initialCooldownSeconds: number = 60) {
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const expiryRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setExpiresIn(initialExpirySeconds);
    setCooldown(initialCooldownSeconds);
  }, [initialExpirySeconds, initialCooldownSeconds]);

  const stop = useCallback(() => {
    setExpiresIn(0);
    setCooldown(0);
  }, []);

  const canResend = cooldown <= 0;
  const isExpired = expiresIn <= 0;

  useEffect(() => {
    if (expiresIn > 0) {
      expiryRef.current = setInterval(() => setExpiresIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => {
      if (expiryRef.current) clearInterval(expiryRef.current);
    };
  }, [expiresIn]);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  const format = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return {
    expiresIn,
    cooldown,
    canResend,
    isExpired,
    start,
    stop,
    format,
    resetCooldown: () => setCooldown(initialCooldownSeconds),
  };
}

export default useOtpTimer;



