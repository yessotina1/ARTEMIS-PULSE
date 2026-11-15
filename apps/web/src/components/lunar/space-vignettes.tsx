/** Vignettes STATIQUES pour la section « Trois espaces » — pas de WebGL. */

export function PlannerVignette() {
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden>
      <rect width="320" height="140" fill="#090e17" />
      <rect x="16" y="16" width="88" height="108" fill="#171c25" stroke="#3d494c" />
      <rect x="116" y="16" width="188" height="70" fill="#1b2029" stroke="#274060" />
      <path d="M130 70 H280" stroke="#4cd7f6" strokeWidth="1.5" fill="none" />
      <path d="M130 55 H250" stroke="#adc6ff" strokeWidth="1" fill="none" opacity="0.7" />
      <rect x="116" y="96" width="58" height="28" fill="#252a34" stroke="#3d494c" />
      <rect x="182" y="96" width="58" height="28" fill="#252a34" stroke="#3d494c" />
      <rect x="248" y="96" width="56" height="28" fill="#252a34" stroke="#3d494c" />
    </svg>
  );
}

export function EducatorVignette() {
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden>
      <rect width="320" height="140" fill="#090e17" />
      <rect x="24" y="24" width="272" height="20" fill="#1b2029" stroke="#3d494c" />
      <rect x="24" y="56" width="120" height="60" fill="#171c25" stroke="#3d494c" />
      <rect x="156" y="56" width="140" height="28" fill="#1b2029" stroke="#274060" />
      <rect x="156" y="92" width="140" height="24" fill="#252a34" stroke="#3d494c" />
      <circle cx="44" cy="34" r="4" fill="#4cd7f6" />
    </svg>
  );
}

export function ExplorerVignette() {
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden>
      <rect width="320" height="140" fill="#090e17" />
      <circle cx="210" cy="70" r="48" fill="#5c6574" />
      <path d="M162 70 H258" stroke="#090e17" strokeWidth="28" />
      <circle cx="70" cy="40" r="3" fill="#adc6ff" />
      <circle cx="188" cy="96" r="3" fill="#4cd7f6" />
      <circle cx="226" cy="88" r="3" fill="#4cd7f6" />
      <rect x="16" y="104" width="100" height="18" fill="#171c25" stroke="#3d494c" />
    </svg>
  );
}
