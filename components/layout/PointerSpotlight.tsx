'use client';

import { useEffect } from 'react';

export default function PointerSpotlight() {
  useEffect(() => {
    let frameId = 0;
    let lastEvent: PointerEvent | null = null;
    let activeCard: HTMLElement | null = null;

    const clearCard = (card: HTMLElement | null) => {
      if (!card) return;
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    };

    const update = () => {
      frameId = 0;
      if (!lastEvent) return;

      const target = lastEvent.target instanceof Element ? lastEvent.target : null;
      const nextCard = target?.closest('.spotlight-card') as HTMLElement | null;

      if (!nextCard) {
        clearCard(activeCard);
        activeCard = null;
        return;
      }

      if (activeCard !== nextCard) {
        clearCard(activeCard);
        activeCard = nextCard;
      }

      const rect = nextCard.getBoundingClientRect();
      const x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((lastEvent.clientY - rect.top) / rect.height) * 100;
      nextCard.style.setProperty('--mx', `${x.toFixed(2)}%`);
      nextCard.style.setProperty('--my', `${y.toFixed(2)}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      lastEvent = event;
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    const onPointerLeaveWindow = () => {
      lastEvent = null;
      clearCard(activeCard);
      activeCard = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeaveWindow);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeaveWindow);
      if (frameId) window.cancelAnimationFrame(frameId);
      clearCard(activeCard);
    };
  }, []);

  return null;
}
