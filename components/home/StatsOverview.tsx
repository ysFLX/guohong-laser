'use client';

import { useEffect, useRef, useState } from 'react';

type StatItem = {
  value: number;
  suffix?: string;
  label: string;
};

type StatsOverviewProps = {
  items: readonly StatItem[];
};

function formatTrInt(value: number) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedValue({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45, rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frameId = 0;
    const durationMs = 1300;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const next = Math.round(value * easeOutCubic(progress));
      setCurrent(next);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [started, value]);

  return (
    <p ref={ref} className="text-2xl font-semibold text-[#ff6a0d] tabular-nums">
      {formatTrInt(current)}
      {suffix}
    </p>
  );
}

export default function StatsOverview({ items }: StatsOverviewProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="spotlight-card rounded-2xl border border-[#ff6a0d]/35 bg-[#15148c] px-4 py-5">
          <AnimatedValue value={item.value} suffix={item.suffix} />
          <p className="mt-1 text-sm text-[#fdf9f6]/85">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
