import { useEffect, useState } from 'react';

const InitialLoader = ({ onComplete, ready }) => {
  const [fade, setFade] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Artificial 1.5s minimum delay to show the DRAPE logo elegantly
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only fade out if both the minimum time has elapsed AND images are actually loaded
    if (minTimeElapsed && ready) {
      setFade(true);
      const outTimer = setTimeout(onComplete, 800); // Wait for CSS opacity transition
      return () => clearTimeout(outTimer);
    }
  }, [minTimeElapsed, ready, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#fff', // Or var(--white)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out',
        pointerEvents: fade ? 'none' : 'all',
      }}
    >
      <h1 
        style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: 'clamp(2rem, 5vw, 4rem)', 
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 400,
          color: 'var(--charcoal)',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}
      >
        DRAPE
      </h1>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
};

export default InitialLoader;
