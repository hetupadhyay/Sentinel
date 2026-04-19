import { useEffect, useRef, useState } from 'react';

export function RevealOnScroll({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.15,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ 
        opacity: isVisible ? 1 : 0, 
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(30px)',
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
      }}
    >
      {children}
    </div>
  );
}
