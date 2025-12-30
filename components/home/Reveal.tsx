'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
};

export default function Reveal({ as, className, delay = 0, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const Tag = (as ?? 'div') as keyof JSX.IntrinsicElements;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={`reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
