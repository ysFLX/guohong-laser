'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

type VideoItem = {
  src: string;
  poster?: string;
  title?: string;
};

const VideoSlider = dynamic(() => import('@/components/home/VideoSlider'), {
  ssr: false,
  loading: () => <div className="h-[260px] rounded-3xl border border-amber-200/25 bg-slate-900 sm:h-[340px] lg:h-[430px] xl:h-[480px]" />,
});

export default function LazyVideoSlider({
  items,
  autoAdvanceMs,
}: {
  items: VideoItem[];
  autoAdvanceMs?: number;
}) {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = rootRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: '360px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      {visible ? (
        <VideoSlider items={items} autoAdvanceMs={autoAdvanceMs} />
      ) : (
        <div className="h-[260px] rounded-3xl border border-amber-200/25 bg-slate-900 sm:h-[340px] lg:h-[430px] xl:h-[480px]" />
      )}
    </div>
  );
}
