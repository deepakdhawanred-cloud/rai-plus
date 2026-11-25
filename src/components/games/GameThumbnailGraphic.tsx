import React from 'react';
import type { CognitiveCategory } from '../../types';

interface GameThumbnailGraphicProps {
  gameId: string;
  category: CognitiveCategory;
}

export const GameThumbnailGraphic: React.FC<GameThumbnailGraphicProps> = ({
  gameId,
  category,
}) => {
  const palette: Record<CognitiveCategory, { bg: string; accent: string; soft: string }> = {
    'Visual Attention': { bg: '#EFF6FF', accent: '#1E3A8A', soft: '#BFDBFE' },
    'Memory Training': { bg: '#ECFDF5', accent: '#065F46', soft: '#A7F3D0' },
    'Perception Training': { bg: '#FFFBEB', accent: '#92400E', soft: '#FDE68A' },
    'Response Control': { bg: '#FEF2F2', accent: '#991B1B', soft: '#FECACA' },
    'Logical Thinking': { bg: '#F8FAFC', accent: '#0F172A', soft: '#CBD5E1' },
    'Cognitive Flexibility': { bg: '#F0F9FF', accent: '#075985', soft: '#BAE6FD' },
  };
  const c = palette[category];

  return (
    <svg
      viewBox="0 0 240 110"
      className="w-full h-24 rounded-lg border border-slate-200/80"
      aria-hidden="true"
    >
      <rect width="240" height="110" fill={c.bg} />

      {gameId === 'spot-the-difference' && (
        <g>
          <rect x="16" y="14" width="96" height="82" rx="6" fill="#FFFFFF" stroke={c.soft} strokeWidth="1.5" />
          <rect x="128" y="14" width="96" height="82" rx="6" fill="#FFFFFF" stroke={c.soft} strokeWidth="1.5" />
          <circle cx="48" cy="46" r="14" fill="#F59E0B" />
          <circle cx="160" cy="46" r="14" fill="#F59E0B" />
          <rect x="74" y="54" width="22" height="24" rx="3" fill={c.accent} />
          <polygon points="196,54 208,78 184,78" fill="#DC2626" />
          <circle cx="196" cy="66" r="18" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeDasharray="3 3" />
        </g>
      )}

      {gameId === 'target-finder' && (
        <g>
          {[0, 1, 2, 3].map((col) =>
            [0, 1, 2].map((row) => {
              const isTarget = (col === 1 && row === 1) || (col === 3 && row === 0);
              return (
                <g key={`${col}-${row}`}>
                  <rect x={30 + col * 48} y={14 + row * 28} width="36" height="22" rx="4" fill={isTarget ? c.accent : '#FFFFFF'} stroke={c.soft} />
                  <circle cx={48 + col * 48} cy={25 + row * 28} r="5" fill={isTarget ? '#FFFFFF' : c.soft} />
                </g>
              );
            }),
          )}
        </g>
      )}

      {gameId === 'symbol-hunter' && (
        <g>
          <rect x="30" y="14" width="180" height="24" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.5" />
          <text x="120" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill={c.accent}>TARGET: ★</text>
          {['★', '◆', '★', '●', '▲'].map((s, idx) => (
            <g key={idx}>
              <rect x={28 + idx * 38} y="48" width="32" height="44" rx="6" fill={s === '★' ? c.accent : '#FFFFFF'} stroke={c.soft} />
              <text x={44 + idx * 38} y="75" textAnchor="middle" fontSize="15" fontWeight="700" fill={s === '★' ? '#FFFFFF' : '#64748B'}>{s}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'focus-filter' && (
        <g>
          <polygon points="38,76 58,32 78,76" fill="#1D4ED8" />
          <polygon points="96,76 116,32 136,76" fill="#D97706" opacity="0.5" />
          <circle cx="174" cy="54" r="20" fill="#1D4ED8" opacity="0.4" />
          <rect x="30" y="24" width="56" height="62" rx="8" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="4 3" />
        </g>
      )}

      {gameId === 'focus-trail' && (
        <g>
          <polyline points="36,78 82,30 132,68 186,28" fill="none" stroke={c.accent} strokeWidth="2.5" strokeDasharray="4 3" />
          {[{ x: 36, y: 78, t: '1' }, { x: 82, y: 30, t: 'A' }, { x: 132, y: 68, t: '2' }, { x: 186, y: 28, t: 'B' }].map((n) => (
            <g key={n.t}>
              <circle cx={n.x} cy={n.y} r="13" fill="#FFFFFF" stroke={c.accent} strokeWidth="2" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.accent}>{n.t}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'memory-match' && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={24 + i * 50} y={22} width="40" height="64" rx="6" fill={i === 1 || i === 3 ? '#FFFFFF' : c.accent} stroke={c.soft} strokeWidth="1.5" />
              {i === 1 || i === 3 ? (
                <polygon points={`${44 + i * 50},38 ${55 + i * 50},60 ${33 + i * 50},60`} fill="#059669" />
              ) : (
                <circle cx={44 + i * 50} cy={54} r="8" fill="#FFFFFF" opacity="0.3" />
              )}
            </g>
          ))}
        </g>
      )}

      {gameId === 'picture-memory' && (
        <g>
          <rect x="26" y="16" width="188" height="78" rx="8" fill="#FFFFFF" stroke={c.soft} strokeWidth="1.5" />
          <rect x="44" y="34" width="36" height="42" rx="4" fill="#1D4ED8" />
          <circle cx="120" cy="54" r="18" fill="#D97706" />
          <polygon points="178,34 198,74 158,74" fill="#059669" />
        </g>
      )}

      {gameId === 'word-recall' && (
        <g>
          {['River', 'Prism', 'Orbit'].map((w, idx) => (
            <g key={w}>
              <rect x={20 + idx * 68} y={36} width="60" height="36" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.4" />
              <text x={50 + idx * 68} y={58} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.accent}>{w}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'sequence-recall' && (
        <g>
          {['#059669', '#0284C7', '#D97706', '#DC2626'].map((fill, idx) => (
            <g key={fill}>
              <rect x={28 + idx * 48} y={32} width="38" height="44" rx="8" fill={fill} opacity={idx === 1 ? 1 : 0.75} />
              <text x={47 + idx * 48} y={59} textAnchor="middle" fontSize="14" fontWeight="700" fill="#FFFFFF">{idx + 1}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'number-recall' && (
        <g>
          <rect x="34" y="26" width="172" height="58" rx="8" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.6" />
          <text x="120" y="63" textAnchor="middle" fontSize="22" fontWeight="800" letterSpacing="6" fill={c.accent}>7 4 9 2</text>
        </g>
      )}

      {gameId === 'story-sequence' && (
        <g>
          {['#1', '#2', '#3'].map((step, idx) => (
            <g key={step}>
              <rect x={22 + idx * 68} y={26} width="58" height="58" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.5" />
              <text x={51 + idx * 68} y={48} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.accent}>{step}</text>
              <line x1={32 + idx * 68} y1="60" x2={70 + idx * 68} y2="60" stroke={c.soft} strokeWidth="3" />
              <line x1={32 + idx * 68} y1="70" x2={62 + idx * 68} y2="70" stroke={c.soft} strokeWidth="3" />
            </g>
          ))}
        </g>
      )}

      {gameId === 'shape-rotation' && (
        <g>
          <polygon points="44,74 44,30 62,30 62,56 84,56 84,74" fill={c.accent} />
          <path d="M108,42 A18,18 0 0,1 138,54" fill="none" stroke="#D97706" strokeWidth="2.5" />
          <polygon points="164,34 208,34 208,52 182,52 182,74 164,74" fill="#D97706" />
        </g>
      )}

      {gameId === 'pattern-detective' && (
        <g>
          {['●', '▲', '■', '?'].map((sym, idx) => (
            <g key={idx}>
              <rect x={24 + idx * 50} y={32} width="40" height="44" rx="6" fill={idx === 3 ? '#FEF3C7' : '#FFFFFF'} stroke={c.accent} strokeDasharray={idx === 3 ? '3 3' : undefined} />
              <text x={44 + idx * 50} y={60} textAnchor="middle" fontSize="16" fontWeight="700" fill={c.accent}>{sym}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'mirror-image' && (
        <g>
          <polygon points="36,78 36,30 68,30 68,48 54,48 54,78" fill={c.accent} />
          <line x1="120" y1="16" x2="120" y2="94" stroke={c.accent} strokeWidth="2" strokeDasharray="5 4" />
          <polygon points="204,78 204,30 172,30 172,48 186,48 186,78" fill="#D97706" />
        </g>
      )}

      {gameId === 'hidden-figures' && (
        <g>
          <rect x="44" y="18" width="152" height="74" fill="#FFFFFF" stroke={c.soft} strokeWidth="1.5" />
          <line x1="44" y1="18" x2="196" y2="92" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="196" y1="18" x2="44" y2="92" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="120" y1="18" x2="120" y2="92" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="120,18 196,18 196,55" fill="rgba(146,64,14,0.22)" stroke={c.accent} strokeWidth="2" />
        </g>
      )}

      {gameId === 'spatial-builder' && (
        <g>
          <polygon points="120,20 162,40 120,60 78,40" fill="#FDE68A" stroke={c.accent} strokeWidth="1.5" />
          <polygon points="78,40 120,60 120,94 78,74" fill="#F59E0B" stroke={c.accent} strokeWidth="1.5" />
          <polygon points="162,40 120,60 120,94 162,74" fill="#D97706" stroke={c.accent} strokeWidth="1.5" />
        </g>
      )}

      {(gameId === 'colour-conflict' || gameId === 'go-no-go' || gameId === 'quick-reaction' || gameId === 'reverse-rule') && (
        <g>
          <rect x="30" y="20" width="180" height="40" rx="8" fill="#FFFFFF" stroke={c.soft} strokeWidth="1.5" />
          <text x="120" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1D4ED8">
            {gameId === 'colour-conflict'
              ? 'RED'
              : gameId === 'go-no-go'
                ? 'GO / HOLD'
                : gameId === 'reverse-rule'
                  ? 'OPPOSITE ➔'
                  : 'TAP NOW'}
          </text>
          <rect x="46" y="72" width="44" height="18" rx="4" fill="#DC2626" />
          <rect x="98" y="72" width="44" height="18" rx="4" fill="#1D4ED8" />
          <rect x="150" y="72" width="44" height="18" rx="4" fill="#059669" />
        </g>
      )}

      {gameId === 'sudoku-challenge' && (
        <g>
          <rect x="74" y="14" width="92" height="82" rx="4" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.8" />
          <line x1="104" y1="14" x2="104" y2="96" stroke={c.soft} />
          <line x1="136" y1="14" x2="136" y2="96" stroke={c.soft} />
          <line x1="74" y1="41" x2="166" y2="41" stroke={c.soft} />
          <line x1="74" y1="69" x2="166" y2="69" stroke={c.soft} />
          <text x="89" y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill={c.accent}>4</text>
          <text x="120" y="59" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0284C7">?</text>
          <text x="151" y="87" textAnchor="middle" fontSize="13" fontWeight="700" fill={c.accent}>1</text>
        </g>
      )}

      {gameId === 'logic-escape' && (
        <g>
          <rect x="34" y="24" width="44" height="62" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.5" />
          <rect x="98" y="24" width="44" height="62" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.5" />
          <rect x="162" y="24" width="44" height="62" rx="6" fill={c.accent} />
          <text x="56" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill={c.accent}>G1</text>
          <text x="120" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill={c.accent}>G2</text>
          <text x="184" y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill="#FFFFFF">EXIT</text>
        </g>
      )}

      {gameId === 'number-detective' && (
        <g>
          {[3, 6, 12, '?'].map((n, idx) => (
            <g key={idx}>
              <circle cx={42 + idx * 52} cy="55" r="20" fill={n === '?' ? '#1E3A8A' : '#FFFFFF'} stroke={c.accent} strokeWidth="1.6" />
              <text x={42 + idx * 52} y="60" textAnchor="middle" fontSize="14" fontWeight="700" fill={n === '?' ? '#FFFFFF' : c.accent}>{n}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'chess-tactics' && (
        <g>
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((col) => (
              <rect key={`${r}-${col}`} x={76 + col * 22} y={11 + r * 22} width="22" height="22" fill={(r + col) % 2 === 0 ? '#F8FAFC' : '#334155'} />
            )),
          )}
          <text x="109" y="50" textAnchor="middle" fontSize="18" fill="#0284C7">♞</text>
          <text x="153" y="28" textAnchor="middle" fontSize="18" fill="#DC2626">♚</text>
        </g>
      )}

      {gameId === 'tower-of-hanoi' && (
        <g>
          <rect x="28" y="86" width="184" height="8" rx="3" fill={c.accent} />
          <rect x="64" y="28" width="6" height="58" fill="#94A3B8" />
          <rect x="117" y="28" width="6" height="58" fill="#94A3B8" />
          <rect x="170" y="28" width="6" height="58" fill="#94A3B8" />
          <rect x="44" y="72" width="46" height="12" rx="4" fill="#1E3A8A" />
          <rect x="50" y="58" width="34" height="12" rx="4" fill="#0284C7" />
          <rect x="56" y="44" width="22" height="12" rx="4" fill="#F59E0B" />
        </g>
      )}

      {gameId === 'phonics-sound-match' && (
        <g>
          <rect x="30" y="18" width="70" height="74" rx="8" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.8" />
          <text x="65" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill={c.accent}>/sh/</text>
          <text x="65" y="74" textAnchor="middle" fontSize="10" fill="#64748B">SOUND</text>
          <rect x="116" y="24" width="94" height="26" rx="6" fill={c.accent} />
          <text x="163" y="41" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">ship</text>
          <rect x="116" y="60" width="94" height="26" rx="6" fill="#FFFFFF" stroke={c.soft} />
          <text x="163" y="77" textAnchor="middle" fontSize="12" fill="#64748B">sip</text>
        </g>
      )}

      {gameId === 'syllable-word-builder' && (
        <g>
          {['phon', '+', 'ics'].map((chunk, idx) => (
            <g key={chunk}>
              {chunk === '+' ? (
                <text x={96} y="46" textAnchor="middle" fontSize="16" fontWeight="700" fill={c.accent}>+</text>
              ) : (
                <>
                  <rect x={idx === 0 ? 28 : 114} y="20" width="56" height="36" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.5" />
                  <text x={idx === 0 ? 56 : 142} y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill={c.accent}>{chunk}</text>
                </>
              )}
            </g>
          ))}
          <rect x="54" y="66" width="132" height="28" rx="6" fill={c.accent} />
          <text x="120" y="84" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">phonics</text>
        </g>
      )}

      {gameId === 'times-tables-sprint' && (
        <g>
          <rect x="38" y="16" width="164" height="36" rx="6" fill="#FFFFFF" stroke={c.accent} strokeWidth="1.6" />
          <text x="120" y="39" textAnchor="middle" fontSize="16" fontWeight="700" fill={c.accent}>7 × 8 = ?</text>
          {[54, 56, 64].map((n, idx) => (
            <g key={n}>
              <rect x={38 + idx * 58} y="62" width="48" height="30" rx="5" fill={n === 56 ? c.accent : '#FFFFFF'} stroke={c.soft} />
              <text x={62 + idx * 58} y="81" textAnchor="middle" fontSize="12" fontWeight="700" fill={n === 56 ? '#FFFFFF' : '#64748B'}>{n}</text>
            </g>
          ))}
        </g>
      )}

      {gameId === 'table-factor-grid' && (
        <g>
          <text x="120" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={c.accent}>MULTIPLES OF 7</text>
          {[14, 19, 21, 28, 33, 35].map((n, idx) => {
            const hit = n % 7 === 0;
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            return (
              <g key={n}>
                <rect x={42 + col * 54} y={34 + row * 32} width="46" height="26" rx="5" fill={hit ? '#059669' : '#FFFFFF'} stroke={c.soft} />
                <text x={65 + col * 54} y={51 + row * 32} textAnchor="middle" fontSize="12" fontWeight="700" fill={hit ? '#FFFFFF' : '#64748B'}>{n}</text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
