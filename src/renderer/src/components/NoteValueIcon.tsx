import type { NoteValue } from '@/lib/music/arrange';

/** A small drawing of a note value: open or filled head, stem, flags, and a dot when dotted. */
const NoteValueIcon = ({ value, dotted = false, className }: { value: NoteValue; dotted?: boolean; className?: string }) => {
  const filled = value >= 4;
  const stem = value >= 2;
  const flags = value === 8 ? 1 : value === 16 ? 2 : 0;
  return (
    <svg viewBox="0 0 16 22" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <ellipse cx="6" cy="17" rx="4.2" ry="3" transform="rotate(-20 6 17)" fill={filled ? 'currentColor' : 'none'} />
      {stem && <line x1="9.8" y1="16" x2="9.8" y2="2" />}
      {Array.from({ length: flags }, (_, i) => (
        <path key={i} d={`M9.8 ${2 + i * 4} q4 2 3.2 6.5`} />
      ))}
      {dotted && <circle cx="14" cy="17" r="1.3" fill="currentColor" stroke="none" />}
    </svg>
  );
};

export default NoteValueIcon;
