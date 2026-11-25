import React from 'react';
import type { BalancePuzzleItem, MatrixCell, MatrixDef, PolyCell } from '../../utils/psychometricEngine';

export const HatchPatternDefs: React.FC = () => (
  <svg width="0" height="0" className="absolute pointer-events-none text-slate-900" aria-hidden="true">
    <defs>
      <pattern
        id="psy-hatch"
        patternUnits="userSpaceOnUse"
        width="7"
        height="7"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="3" />
      </pattern>
    </defs>
  </svg>
);

const POS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [29, 50],
    [71, 50],
  ],
  3: [
    [50, 28],
    [28, 71],
    [72, 71],
  ],
  4: [
    [29, 29],
    [71, 29],
    [29, 71],
    [71, 71],
  ],
};

const SZ: Record<number, number> = { 1: 50, 2: 32, 3: 30, 4: 30 };

const renderMatrixShape = (
  shape: MatrixCell['shape'],
  cx: number,
  cy: number,
  s: number,
  fill: MatrixCell['fill'],
  rot: number,
  key: number,
) => {
  const f = fill === 'solid' ? 'currentColor' : fill === 'striped' ? 'url(#psy-hatch)' : 'none';
  if (shape === 'circle') {
    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={s / 2}
        fill={f}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  }
  if (shape === 'square') {
    return (
      <rect
        key={key}
        x={cx - s / 2 + 2}
        y={cy - s / 2 + 2}
        width={s - 4}
        height={s - 4}
        fill={f}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  }
  if (shape === 'triangle') {
    const h = s / 2;
    return (
      <polygon
        key={key}
        points={`${cx},${cy - h} ${cx + h},${cy + h * 0.8} ${cx - h},${cy + h * 0.8}`}
        fill={f}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  }
  const arrowPts = [
    [0, -0.5],
    [0.4, -0.02],
    [0.15, -0.02],
    [0.15, 0.5],
    [-0.15, 0.5],
    [-0.15, -0.02],
    [-0.4, -0.02],
  ]
    .map(([x, y]) => `${cx + x * s},${cy + y * s}`)
    .join(' ');
  return (
    <polygon
      key={key}
      points={arrowPts}
      transform={`rotate(${rot} ${cx} ${cy})`}
      fill={f}
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  );
};

export const MatrixCellSvg: React.FC<{ cell: MatrixCell; size?: number }> = ({
  cell,
  size = 76,
}) => {
  const coords = POS[cell.n] || POS[1];
  const sz = SZ[cell.n] || 40;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="text-slate-900"
      aria-hidden="true"
    >
      {coords.map(([x, y], idx) =>
        renderMatrixShape(cell.shape, x, y, sz, cell.fill, cell.rot, idx),
      )}
    </svg>
  );
};

export const MatrixGrid: React.FC<{ def: MatrixDef }> = ({ def }) => (
  <div
    className="grid grid-cols-3 border-2 border-slate-900 w-max mx-auto bg-white"
    aria-label="3 by 3 pattern with the bottom-right cell missing"
  >
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <div
          key={`${r}-${c}`}
          className="w-24 h-24 border border-slate-200 grid place-items-center"
        >
          {r === 2 && c === 2 ? (
            <span className="text-3xl font-bold text-amber-700 font-serif">?</span>
          ) : (
            <MatrixCellSvg cell={def.f(r, c)} size={78} />
          )}
        </div>
      )),
    )}
  </div>
);

export const PolyominoSvg: React.FC<{ cells: PolyCell[]; size?: number }> = ({
  cells,
  size = 80,
}) => {
  const w = Math.max(...cells.map((p) => p[0])) + 1;
  const h = Math.max(...cells.map((p) => p[1])) + 1;
  const u = 16;
  const ox = 50 - (w * u) / 2;
  const oy = 50 - (h * u) / 2;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="text-slate-900"
      aria-hidden="true"
    >
      {cells.map(([x, y], idx) => (
        <rect
          key={idx}
          x={ox + x * u}
          y={oy + y * u}
          width={u}
          height={u}
          fill="currentColor"
          fillOpacity="0.88"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
};

export const BlockFaceSvg: React.FC<{ face: number | null; size?: number }> = ({
  face,
  size = 48,
}) => {
  if (face == null) {
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className="block">
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeDasharray="4 3"
        />
      </svg>
    );
  }
  const polyMap: Record<number, string> = {
    1: '0,0 40,0 40,40 0,40',
    2: '0,0 40,0 0,40',
    3: '0,0 40,0 40,40',
    4: '40,0 40,40 0,40',
    5: '0,0 40,40 0,40',
  };
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className="block">
      <rect x="0" y="0" width="40" height="40" fill="#fbfbf8" />
      {polyMap[face] && <polygon points={polyMap[face]} fill="#c23b32" />}
      <rect x="0.5" y="0.5" width="39" height="39" fill="none" stroke="#64748b" />
    </svg>
  );
};

const FW_COL: Record<string, string> = {
  C: '#1d5b86',
  S: '#b0731a',
  T: '#2e7a4d',
  D: '#b23b3b',
  R: '#18212b',
};

const BalanceShapeGlyph: React.FC<{ ch: string }> = ({ ch }) => {
  const fill = FW_COL[ch] || '#18212b';
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      {ch === 'C' && <circle cx="12" cy="12" r="9" fill={fill} />}
      {ch === 'S' && <rect x="3" y="3" width="18" height="18" fill={fill} />}
      {ch === 'T' && <polygon points="12,2 22,21 2,21" fill={fill} />}
      {ch === 'D' && <polygon points="12,1 23,12 12,23 1,12" fill={fill} />}
      {ch === 'R' && (
        <polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9" fill={fill} />
      )}
    </svg>
  );
};

export const BalancePan: React.FC<{ shapes: string }> = ({ shapes }) => (
  <span className="inline-flex flex-wrap items-center gap-1 px-2.5 py-1.5 border-b-[3px] border-slate-900 min-h-[38px] max-w-[300px]">
    {[...shapes].map((ch, idx) => (
      <BalanceShapeGlyph key={idx} ch={ch} />
    ))}
  </span>
);

export const BalanceScaleFigure: React.FC<{ item: Pick<BalancePuzzleItem, 'eq' | 'q'> }> = ({
  item,
}) => (
  <div className="flex flex-col items-center gap-2.5 py-1">
    {item.eq.map(([left, right], k) => (
      <div key={k} className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-medium text-slate-500 min-w-[60px] text-right">
          Scale {k + 1}
        </span>
        <BalancePan shapes={left} />
        <span className="text-xs text-slate-500 font-medium">balances</span>
        <BalancePan shapes={right} />
      </div>
    ))}
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-dashed border-slate-300 w-full">
      <span className="text-xs font-semibold text-slate-700 min-w-[60px] text-right">Question</span>
      <BalancePan shapes={item.q} />
      <span className="text-xs text-slate-500 font-medium">balances</span>
      <span className="inline-flex items-center justify-center px-3 py-1 border-b-[3px] border-slate-900 min-h-[38px] text-2xl font-bold text-amber-700 font-serif">
        ?
      </span>
    </div>
  </div>
);

export const CodingGlyphSvg: React.FC<{ id: number; size?: number }> = ({ id, size = 38 }) => {
  const b = Math.floor(id / 6) % 4;
  const m = id % 6;
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className="text-slate-900"
      aria-hidden="true"
    >
      {b === 0 && (
        <circle
          cx="20"
          cy="20"
          r="14"
          stroke="currentColor"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {b === 1 && (
        <rect
          x="6"
          y="6"
          width="28"
          height="28"
          stroke="currentColor"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {b === 2 && (
        <polygon
          points="20,4 36,34 4,34"
          stroke="currentColor"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {b === 3 && (
        <polygon
          points="20,3 37,20 20,37 3,20"
          stroke="currentColor"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {m === 1 && <circle cx="20" cy="22" r="3" fill="currentColor" />}
      {m === 2 && (
        <line
          x1="12"
          y1="22"
          x2="28"
          y2="22"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      )}
      {m === 3 && (
        <line
          x1="20"
          y1="13"
          x2="20"
          y2="30"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      )}
      {m === 4 && (
        <line
          x1="13"
          y1="29"
          x2="27"
          y2="15"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      )}
      {m === 5 && (
        <line
          x1="13"
          y1="15"
          x2="27"
          y2="29"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};
