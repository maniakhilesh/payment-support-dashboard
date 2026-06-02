import { useEffect, useState } from 'react';

const COLOR_FALLBACKS = {
  blue: '#00D4FF',
  green: '#00FF88',
  red: '#FF4757',
  amber: '#FFB300',
};

function StatCard({ title, value, color = 'blue', icon = '', label, note, tone, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const normalizedTitle = title || label || '';
  const targetValue = Number(value) || 0;
  const accentColor = COLOR_FALLBACKS[color] || color || COLOR_FALLBACKS.blue;
  const displayTone = tone || color || 'blue';

  useEffect(() => {
    let intervalId;
    let timeoutId;
    const duration = 900;
    const steps = 30;
    const increment = targetValue / steps;
    let current = 0;

    timeoutId = window.setTimeout(() => setDisplayValue(0), 0);
    intervalId = window.setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        window.clearInterval(intervalId);
        return;
      }

      setDisplayValue(Math.round(current));
    }, duration / steps);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [targetValue]);

  return (
    <article className={`stat-card stat-card--${displayTone}`} style={{ '--card-accent': accentColor }}>
      <div className="stat-card__top">
        <span className="stat-card__icon" aria-hidden="true">
          {icon}
        </span>
        <p className="stat-card__label">{normalizedTitle}</p>
      </div>
      <div className="stat-card__value">
        <span>{displayValue}</span>
        <span className="stat-card__suffix">{suffix}</span>
      </div>
      {note ? <p className="stat-card__note">{note}</p> : null}
    </article>
  );
}

export default StatCard;