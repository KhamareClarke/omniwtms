import React, { useEffect, useState } from 'react';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownSlots() {
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [slotsLeft, setSlotsLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Only fetch data once on mount, then update countdown locally every second
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let endTime: number | null = null;
    let initialCountdown: Countdown | null = null;
    let initialSlots: number | null = null;
    let didUnmount = false;

    async function fetchStatus() {
      setLoading(true);
      const res = await fetch('/api/offer-status');
      const data = await res.json();
      initialCountdown = data.countdown;
      initialSlots = data.slotsLeft;
      // Calculate end time based on server countdown
      const now = Date.now();
      endTime = now + (
        (data.countdown.days * 24 * 60 * 60 + data.countdown.hours * 60 * 60 + data.countdown.minutes * 60 + data.countdown.seconds) * 1000
      );
      setCountdown(data.countdown);
      setSlotsLeft(data.slotsLeft);
      setLoading(false);
      if (!timer) startTimer();
    }

    function startTimer() {
      timer = setInterval(() => {
        if (!endTime || didUnmount) return;
        const now = Date.now();
        let diff = Math.max(0, Math.floor((endTime - now) / 1000));
        const days = Math.floor(diff / (24 * 60 * 60));
        diff -= days * 24 * 60 * 60;
        const hours = Math.floor(diff / (60 * 60));
        diff -= hours * 60 * 60;
        const minutes = Math.floor(diff / 60);
        const seconds = diff - minutes * 60;
        setCountdown({ days, hours, minutes, seconds });
      }, 1000);
    }

    fetchStatus();
    return () => {
      didUnmount = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  // Always reserve space to prevent layout shift/flicker
  const reservedHeight = '56px'; // Approximate height of countdown row

  // Always show countdown and slots, even if not loaded yet
  const safeCountdown = countdown || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const safeSlots = slotsLeft ?? 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-semibold mt-4 mb-8" style={{ minHeight: reservedHeight }}>
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-full shadow-sm border border-orange-200 min-w-[220px]">
        <span className="font-bold">Limited Time:</span>
        <span>{safeCountdown.days}d</span>:
        <span>{safeCountdown.hours}h</span>:
        <span>{safeCountdown.minutes}m</span>:
        <span>{safeCountdown.seconds}s</span>
      </div>
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 px-4 py-2 rounded-full shadow-sm border border-blue-200 min-w-[180px]">
        <span className="font-bold">Slots Left:</span>
        <span className="text-2xl font-extrabold text-green-700">{safeSlots}</span>
      </div>
    </div>
  );
}
