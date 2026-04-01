'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  delay?: number;
  distance?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
};

export default function Reveal({
  as,
  className,
  delay = 0,
  distance = 28,
  duration = 820,
  threshold = 0.2,
  once = true,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const Tag = (as ?? 'div') as React.ElementType;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={`reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={
        {
          ...style,
          transitionDelay: delay ? `${delay}ms` : undefined,
          transitionDuration: `${duration}ms`,
          ['--reveal-offset' as string]: `${distance}px`,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
