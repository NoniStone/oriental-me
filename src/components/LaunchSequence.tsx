import { useEffect } from "react";

type LaunchSequenceProps = {
  onComplete: () => void;
};

const words = "Oriental Me".split("");

const LaunchSequence = ({ onComplete }: LaunchSequenceProps) => {
  useEffect(() => {
    // Let the completed mark fade away before revealing the next screen.
    const timer = window.setTimeout(onComplete, 2400);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="launch-screen" role="status" aria-label="Opening Oriental Me">
      <div className="launch-wash launch-wash-one" />
      <div className="launch-wash launch-wash-two" />
      <div className="launch-brand">
        <p className="launch-word" aria-label="Oriental Me">
          {words.map((letter, index) => <span key={`${letter}-${index}`} style={{ animationDelay: `${180 + index * 70}ms` }}>{letter === " " ? "\u00a0" : letter}</span>)}
        </p>
        <p className="launch-ink">养生</p>
        <svg className="launch-taiji" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="currentColor" />
          <path d="M50 4a23 23 0 0 1 0 46 23 23 0 0 0 0 46 46 46 0 0 0 0-92Z" fill="hsl(var(--background))" />
          <circle cx="50" cy="27" r="7" fill="currentColor" />
          <circle cx="50" cy="73" r="7" fill="hsl(var(--background))" />
        </svg>
      </div>
    </div>
  );
};

export default LaunchSequence;
