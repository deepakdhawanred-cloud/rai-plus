import React from 'react';
import type {
  VcipMatrixCellSpec,
  VcipSpatialSpec,
  VcipSymbolKeyEntry,
} from '../../types/vcip';

// ============================================================================
// 1. FLUID REASONING 3×3 MATRIX CELL SVG (100% Original Geometric Vectors)
// ============================================================================

function renderShapePrimitive(
  shape: VcipMatrixCellSpec['shape'],
  cx: number,
  cy: number,
  r: number,
  fillVal: string,
  strokeVal: string,
  strokeWidth: number,
) {
  switch (shape) {
    case 'circle':
      return <circle cx={cx} cy={cy} r={r} fill={fillVal} stroke={strokeVal} strokeWidth={strokeWidth} />;
    case 'ring':
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={strokeVal} strokeWidth={strokeWidth + 1.5} />
          <circle cx={cx} cy={cy} r={r * 0.45} fill={fillVal} stroke={strokeVal} strokeWidth={1.2} />
        </g>
      );
    case 'square':
      return (
        <rect
          x={cx - r * 0.85}
          y={cy - r * 0.85}
          width={r * 1.7}
          height={r * 1.7}
          rx={2}
          fill={fillVal}
          stroke={strokeVal}
          strokeWidth={strokeWidth}
        />
      );
    case 'diamond': {
      const pts = `${cx},${cy - r} ${cx + r * 0.85},${cy} ${cx},${cy + r} ${cx - r * 0.85},${cy}`;
      return <polygon points={pts} fill={fillVal} stroke={strokeVal} strokeWidth={strokeWidth} />;
    }
    case 'triangle': {
      const pts = `${cx},${cy - r} ${cx + r * 0.92},${cy + r * 0.78} ${cx - r * 0.92},${cy + r * 0.78}`;
      return <polygon points={pts} fill={fillVal} stroke={strokeVal} strokeWidth={strokeWidth} />;
    }
    case 'pentagon': {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (-90 + i * 72) * (Math.PI / 180);
        return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
      }).join(' ');
      return <polygon points={pts} fill={fillVal} stroke={strokeVal} strokeWidth={strokeWidth} />;
    }
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (-30 + i * 60) * (Math.PI / 180);
        return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
      }).join(' ');
      return <polygon points={pts} fill={fillVal} stroke={strokeVal} strokeWidth={strokeWidth} />;
    }
    case 'plus': {
      const t = r * 0.36;
      const d = [
        `M ${cx - t} ${cy - r}`,
        `H ${cx + t}`,
        `V ${cy - t}`,
        `H ${cx + r}`,
        `V ${cy + t}`,
        `H ${cx + t}`,
        `V ${cy + r}`,
        `H ${cx - t}`,
        `V ${cy + t}`,
        `H ${cx - r}`,
        `V ${cy - t}`,
        `H ${cx - t}`,
        'Z',
      ].join(' ');
      return <path d={d} fill={fillVal} stroke={strokeVal} strokeWidth={strokeWidth} />;
    }
  }
}

export const MatrixCellSvg: React.FC<{
  spec: VcipMatrixCellSpec | null;
  size?: number;
  uid?: string;
}> = ({ spec, size = 84, uid = 'mc' }) => {
  if (!spec) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="mx-auto block"
        aria-label="Missing pattern cell"
      >
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="10"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="34"
          fontWeight="700"
          fill="#334155"
        >
          ?
        </text>
      </svg>
    );
  }

  const patternId = `stripe-${uid}-${spec.color.replace('#', '')}`;
  const dotPatternId = `dot-${uid}-${spec.color.replace('#', '')}`;
  const fillVal =
    spec.fill === 'solid'
      ? spec.color
      : spec.fill === 'outline'
        ? '#ffffff'
        : spec.fill === 'striped'
          ? `url(#${patternId})`
          : `url(#${dotPatternId})`;

  const positions: Array<[number, number]> =
    spec.count === 1
      ? [[50, 50]]
      : spec.count === 2
        ? [
            [32, 50],
            [68, 50],
          ]
        : spec.count === 3
          ? [
              [50, 30],
              [30, 68],
              [70, 68],
            ]
          : [
              [31, 31],
              [69, 31],
              [31, 69],
              [69, 69],
            ];

  const radius = spec.count === 1 ? 24 : spec.count === 2 ? 15 : 13;
  const cornerCoords: Array<[number, number]> = [
    [22, 22],
    [78, 22],
    [78, 78],
    [22, 78],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="mx-auto block"
      role="img"
      aria-label={`${spec.count} ${spec.fill} ${spec.shape} rotated ${spec.rotation} degrees`}
    >
      <defs>
        <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#ffffff" />
          <line x1="0" y1="0" x2="0" y2="6" stroke={spec.color} strokeWidth="2.8" />
        </pattern>
        <pattern id={dotPatternId} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#ffffff" />
          <circle cx="4" cy="4" r="1.8" fill={spec.color} />
        </pattern>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      <g transform={`rotate(${spec.rotation} 50 50)`}>
        {positions.map(([cx, cy], idx) => (
          <React.Fragment key={idx}>
            {renderShapePrimitive(spec.shape, cx, cy, radius, fillVal, spec.color, 2.2)}
          </React.Fragment>
        ))}
      </g>
      {spec.dotCorner !== undefined && (
        <circle
          cx={cornerCoords[spec.dotCorner % 4][0]}
          cy={cornerCoords[spec.dotCorner % 4][1]}
          r="5.5"
          fill={spec.color}
        />
      )}
    </svg>
  );
};

// ============================================================================
// 2. PROCESSING SPEED ORIGINAL SYMBOL GLYPHS (9 Distinct Clean Shapes)
// ============================================================================

export const ProcessingSymbolSvg: React.FC<{
  symbolId: VcipSymbolKeyEntry['symbolId'];
  size?: number;
  color?: string;
}> = ({ symbolId, size = 34, color = '#0f172a' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="mx-auto block" aria-hidden="true">
      {symbolId === 'chevron' && (
        <path
          d="M9 15 L20 7 L31 15 M9 27 L20 19 L31 27"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {symbolId === 'hourglass' && (
        <path
          d="M11 8 H29 L20 20 L29 32 H11 L20 20 Z"
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      )}
      {symbolId === 'diamond_dot' && (
        <g>
          <polygon points="20,6 34,20 20,34 6,20" fill="none" stroke={color} strokeWidth="2.8" />
          <circle cx="20" cy="20" r="3.6" fill={color} />
        </g>
      )}
      {symbolId === 'crescent' && (
        <path
          d="M25 8 A12 12 0 1 0 25 32 A9 9 0 1 1 25 8 Z"
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      )}
      {symbolId === 'cross_bar' && (
        <path
          d="M20 7 V33 M8 14 H32 M12 26 H28"
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}
      {symbolId === 'trident' && (
        <path
          d="M10 10 V19 C10 23 30 23 30 19 V10 M20 8 V33"
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {symbolId === 'arch' && (
        <path
          d="M9 31 V20 A11 11 0 0 1 31 20 V31 M9 31 H31"
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}
      {symbolId === 'parallel' && (
        <path
          d="M8 12 H32 M8 20 H32 M8 28 H32 M14 7 L26 33"
          fill="none"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )}
      {symbolId === 'spiral_box' && (
        <g>
          <rect x="8" y="8" width="24" height="24" fill="none" stroke={color} strokeWidth="2.6" />
          <rect x="15" y="15" width="10" height="10" fill={color} />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 3. SPATIAL REASONING ORIGINAL SVG RENDERERS (2D Rotation, 3D Iso, Cube Net, Assembly)
// ============================================================================

function transformPolyomino(
  cells: Array<[number, number]>,
  rotationDeg = 0,
  mirrored = false,
): Array<[number, number]> {
  let pts = cells.map(([x, y]): [number, number] => (mirrored ? [-x, y] : [x, y]));
  const steps = ((((rotationDeg % 360) + 360) % 360) / 90) | 0;
  for (let s = 0; s < steps; s += 1) {
    // 90° clockwise in screen coords (x right, y down): (x, y) -> (-y, x)
    pts = pts.map(([x, y]): [number, number] => [-y, x]);
  }
  const minX = Math.min(...pts.map(([x]) => x));
  const minY = Math.min(...pts.map(([, y]) => y));
  return pts.map(([x, y]): [number, number] => [x - minX, y - minY]);
}

export const SpatialVisualSvg: React.FC<{
  spec: VcipSpatialSpec;
  size?: number;
}> = ({ spec, size = 128 }) => {
  if (spec.kind === 'rotation_2d' && spec.cells) {
    const transformed = transformPolyomino(spec.cells, spec.rotationDeg || 0, spec.mirrored || false);
    const maxX = Math.max(...transformed.map(([x]) => x));
    const maxY = Math.max(...transformed.map(([, y]) => y));
    const cols = maxX + 1;
    const rows = maxY + 1;
    const cellSize = Math.min(24, Math.floor(84 / Math.max(cols, rows, 3)));
    const offsetX = (120 - cols * cellSize) / 2;
    const offsetY = (120 - rows * cellSize) / 2;

    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className="mx-auto block">
        <rect x="4" y="4" width="112" height="112" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {transformed.map(([x, y], idx) => (
          <g key={idx}>
            <rect
              x={offsetX + x * cellSize}
              y={offsetY + y * cellSize}
              width={cellSize - 2}
              height={cellSize - 2}
              rx="3"
              fill={idx === 0 ? '#0f172a' : spec.accentColor}
              fillOpacity={idx === 0 ? 0.9 : 0.85}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {idx === 0 && (
              <circle
                cx={offsetX + x * cellSize + (cellSize - 2) / 2}
                cy={offsetY + y * cellSize + (cellSize - 2) / 2}
                r="2.8"
                fill="#ffffff"
              />
            )}
          </g>
        ))}
      </svg>
    );
  }

  if (spec.kind === 'isometric_3d' && spec.blocks3d) {
    // Isometric projection with painter's order (x + y + z)
    const sorted = [...spec.blocks3d].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
    const u = 16;
    const ox = 60;
    const oy = 76;
    const project = (x: number, y: number, z: number): [number, number] => [
      ox + (x - y) * u * 0.866,
      oy + (x + y) * u * 0.5 - z * u,
    ];

    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className="mx-auto block">
        <rect x="4" y="4" width="112" height="112" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {sorted.map(([bx, by, bz], i) => {
          const top0 = project(bx, by, bz + 1);
          const top1 = project(bx + 1, by, bz + 1);
          const top2 = project(bx + 1, by + 1, bz + 1);
          const top3 = project(bx, by + 1, bz + 1);
          const bot1 = project(bx + 1, by, bz);
          const bot2 = project(bx + 1, by + 1, bz);
          const bot3 = project(bx, by + 1, bz);

          return (
            <g key={i} stroke="#ffffff" strokeWidth="1.1" strokeLinejoin="round">
              {/* Top face */}
              <polygon
                points={`${top0} ${top1} ${top2} ${top3}`}
                fill={spec.accentColor}
                fillOpacity="0.65"
              />
              {/* Right face */}
              <polygon
                points={`${top1} ${top2} ${bot2} ${bot1}`}
                fill={spec.accentColor}
                fillOpacity="0.95"
              />
              {/* Left face */}
              <polygon
                points={`${top3} ${top2} ${bot2} ${bot3}`}
                fill={spec.accentColor}
                fillOpacity="0.82"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  if (spec.kind === 'cube_net' && spec.netFaces) {
    if (spec.netFaces.length === 2) {
      // Compact option pair card
      return (
        <svg width={size} height={Math.round(size * 0.65)} viewBox="0 0 120 76" className="mx-auto block">
          <rect x="10" y="14" width="38" height="48" rx="6" fill="#fffbeb" stroke={spec.accentColor} strokeWidth="2" />
          <text x="29" y="46" textAnchor="middle" fontSize="22" fill="#0f172a">
            {spec.netFaces[0]}
          </text>
          <text x="60" y="43" textAnchor="middle" fontSize="13" fontWeight="600" fill="#64748b">
            ↔
          </text>
          <rect x="72" y="14" width="38" height="48" rx="6" fill="#fffbeb" stroke={spec.accentColor} strokeWidth="2" />
          <text x="91" y="46" textAnchor="middle" fontSize="22" fill="#0f172a">
            {spec.netFaces[1]}
          </text>
        </svg>
      );
    }
    // Standard 6-face cross net: (1,0), (0,1), (1,1), (2,1), (1,2), (1,3)
    const coords: Array<[number, number]> = [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
      [1, 3],
    ];
    const sq = 24;
    const ox = 24;
    const oy = 12;
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className="mx-auto block">
        <rect x="4" y="4" width="112" height="112" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {coords.map(([cx, cy], idx) => (
          <g key={idx}>
            <rect
              x={ox + cx * sq}
              y={oy + cy * sq}
              width={sq}
              height={sq}
              fill={idx === 2 ? '#fef3c7' : '#ffffff'}
              stroke={spec.accentColor}
              strokeWidth="1.8"
            />
            <text
              x={ox + cx * sq + sq / 2}
              y={oy + cy * sq + sq / 2 + 5}
              textAnchor="middle"
              fontSize="13"
              fill="#0f172a"
            >
              {spec.netFaces?.[idx] ?? ''}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  if (spec.kind === 'shape_assembly' && spec.pieceA && spec.pieceB) {
    const drawPiece = (cells: Array<[number, number]>, ox: number, oy: number, color: string) =>
      cells.map(([x, y], idx) => (
        <rect
          key={idx}
          x={ox + x * 18}
          y={oy + y * 18}
          width={16}
          height={16}
          rx="2"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      ));
    return (
      <svg width={size + 36} height={size} viewBox="0 0 160 120" className="mx-auto block">
        <rect x="4" y="4" width="152" height="112" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        <text x="36" y="24" textAnchor="middle" fontSize="10" fontWeight="600" fill="#475569">
          Piece 1
        </text>
        {drawPiece(spec.pieceA, 20, 38, spec.accentColor)}
        <text x="80" y="64" textAnchor="middle" fontSize="18" fontWeight="700" fill="#64748b">
          +
        </text>
        <text x="122" y="24" textAnchor="middle" fontSize="10" fontWeight="600" fill="#475569">
          Piece 2
        </text>
        {drawPiece(spec.pieceB, 102, 38, '#0f766e')}
      </svg>
    );
  }

  return null;
};
