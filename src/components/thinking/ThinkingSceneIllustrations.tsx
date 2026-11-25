import React from 'react';

interface ThinkingSceneIllustrationProps {
  sceneCode?: string;
  caption?: string;
}

/**
 * Renders 11 distinct TAT visual scenes (tat_scene_01..tat_scene_11) and
 * 12 distinct monthly ambiguous monochrome PPDT scenes (ppdt_month_01..ppdt_month_12).
 */
export const ThinkingSceneIllustration: React.FC<ThinkingSceneIllustrationProps> = ({
  sceneCode,
  caption,
}) => {
  const renderSvg = () => {
    switch (sceneCode) {
      // ==================== 11 TAT SCENES ====================
      case 'tat_scene_01':
      case 'tat_bridge_team':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Monsoon footbridge repair'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <path d="M0 132 Q105 112 210 132 T420 132 L420 180 L0 180 Z" fill="#94A3B8" opacity="0.7" />
            <rect x="65" y="102" width="290" height="12" rx="3" fill="#475569" />
            <line x1="90" y1="114" x2="90" y2="158" stroke="#334155" strokeWidth="6" />
            <line x1="330" y1="114" x2="330" y2="158" stroke="#334155" strokeWidth="6" />
            <circle cx="148" cy="76" r="10" fill="#1E293B" />
            <rect x="141" y="87" width="14" height="24" rx="4" fill="#334155" />
            <circle cx="195" cy="79" r="9" fill="#1E293B" />
            <rect x="189" y="89" width="12" height="22" rx="4" fill="#475569" />
            <circle cx="260" cy="75" r="10" fill="#1E293B" />
            <rect x="253" y="86" width="14" height="25" rx="4" fill="#1E293B" />
            <line x1="205" y1="103" x2="250" y2="91" stroke="#64748B" strokeWidth="4" />
          </svg>
        );

      case 'tat_scene_02':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Late-night study lamp'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <rect x="265" y="18" width="120" height="86" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
            <line x1="286" y1="26" x2="276" y2="96" stroke="#E2E8F0" strokeWidth="2" />
            <line x1="320" y1="26" x2="310" y2="96" stroke="#E2E8F0" strokeWidth="2" />
            <line x1="354" y1="26" x2="344" y2="96" stroke="#E2E8F0" strokeWidth="2" />
            <rect x="40" y="122" width="250" height="14" rx="3" fill="#334155" />
            <circle cx="132" cy="74" r="14" fill="#1E293B" />
            <path d="M112 122 C112 94 152 94 152 122 Z" fill="#334155" />
            <rect x="174" y="106" width="58" height="16" rx="2" fill="#F8FAFC" stroke="#475569" />
            <path d="M235 122 L248 82 L222 82 Z" fill="#475569" />
            <polygon points="222,82 248,82 260,122 208,122" fill="#F8FAFC" opacity="0.3" />
            <circle cx="82" cy="48" r="16" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
            <line x1="82" y1="48" x2="82" y2="38" stroke="#1E293B" strokeWidth="2" />
            <line x1="82" y1="48" x2="91" y2="51" stroke="#1E293B" strokeWidth="2" />
          </svg>
        );

      case 'tat_scene_03':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Science lab experiment'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <rect x="45" y="118" width="330" height="16" rx="3" fill="#475569" />
            <polygon points="188,118 202,84 214,84 228,118" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            <rect x="204" y="72" width="8" height="12" fill="#64748B" />
            <rect x="246" y="92" width="22" height="26" rx="2" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
            <circle cx="135" cy="70" r="12" fill="#1E293B" />
            <rect x="125" y="84" width="20" height="34" rx="5" fill="#334155" />
            <circle cx="300" cy="72" r="12" fill="#334155" />
            <rect x="290" y="86" width="20" height="32" rx="5" fill="#475569" />
            <rect x="85" y="24" width="250" height="28" rx="3" fill="#CBD5E1" />
          </svg>
        );

      case 'tat_scene_04':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Sports track and fallen runner'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <path d="M0 120 L420 105 L420 180 L0 180 Z" fill="#94A3B8" opacity="0.55" />
            <line x1="0" y1="142" x2="420" y2="128" stroke="#F8FAFC" strokeWidth="2" strokeDasharray="8 6" />
            <line x1="340" y1="90" x2="340" y2="170" stroke="#334155" strokeWidth="3" />
            <circle cx="165" cy="126" r="10" fill="#334155" />
            <rect x="145" y="136" width="44" height="14" rx="6" fill="#475569" />
            <circle cx="218" cy="86" r="11" fill="#1E293B" />
            <path d="M212 98 L195 130 L226 130 Z" fill="#1E293B" />
            <circle cx="288" cy="78" r="9" fill="#64748B" />
            <rect x="282" y="88" width="12" height="28" rx="4" fill="#64748B" />
          </svg>
        );

      case 'tat_scene_05':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Crowded bus stand assistance'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <rect x="24" y="34" width="372" height="14" fill="#475569" />
            <line x1="60" y1="48" x2="60" y2="155" stroke="#475569" strokeWidth="5" />
            <line x1="360" y1="48" x2="360" y2="155" stroke="#475569" strokeWidth="5" />
            <rect x="255" y="56" width="82" height="36" rx="3" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            <circle cx="150" cy="84" r="11" fill="#334155" />
            <rect x="142" y="96" width="16" height="42" rx="5" fill="#475569" />
            <rect x="112" y="122" width="24" height="22" rx="3" fill="#64748B" />
            <circle cx="204" cy="80" r="11" fill="#1E293B" />
            <rect x="196" y="92" width="16" height="46" rx="5" fill="#1E293B" />
            <line x1="160" y1="108" x2="195" y2="104" stroke="#1E293B" strokeWidth="3" />
          </svg>
        );

      case 'tat_scene_06':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Community plantation drive'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <rect x="0" y="128" width="420" height="52" fill="#CBD5E1" />
            <line x1="120" y1="138" x2="120" y2="104" stroke="#334155" strokeWidth="3" />
            <circle cx="120" cy="98" r="11" fill="#64748B" />
            <line x1="295" y1="138" x2="295" y2="108" stroke="#334155" strokeWidth="3" />
            <circle cx="295" cy="102" r="10" fill="#64748B" />
            <circle cx="165" cy="78" r="10" fill="#1E293B" />
            <rect x="158" y="89" width="14" height="39" rx="4" fill="#334155" />
            <circle cx="215" cy="82" r="10" fill="#334155" />
            <rect x="208" y="93" width="14" height="35" rx="4" fill="#475569" />
            <circle cx="258" cy="79" r="10" fill="#1E293B" />
            <rect x="251" y="90" width="14" height="38" rx="4" fill="#334155" />
          </svg>
        );

      case 'tat_scene_07':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Mountain ridge trail'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <polygon points="0,180 120,62 240,180" fill="#94A3B8" />
            <polygon points="150,180 290,44 420,180" fill="#64748B" opacity="0.75" />
            <ellipse cx="110" cy="34" rx="44" ry="14" fill="#F8FAFC" opacity="0.7" />
            <ellipse cx="320" cy="28" rx="52" ry="16" fill="#F8FAFC" opacity="0.6" />
            <circle cx="176" cy="108" r="9" fill="#1E293B" />
            <rect x="170" y="118" width="12" height="28" rx="4" fill="#1E293B" />
            <circle cx="212" cy="112" r="9" fill="#1E293B" />
            <rect x="206" y="122" width="12" height="26" rx="4" fill="#334155" />
            <circle cx="246" cy="116" r="9" fill="#334155" />
            <rect x="240" y="126" width="12" height="24" rx="4" fill="#475569" />
          </svg>
        );

      case 'tat_scene_08':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Library table discussion'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <rect x="30" y="18" width="76" height="110" rx="3" fill="#CBD5E1" stroke="#64748B" />
            <rect x="314" y="18" width="76" height="110" rx="3" fill="#CBD5E1" stroke="#64748B" />
            <rect x="122" y="114" width="176" height="14" rx="3" fill="#334155" />
            <circle cx="154" cy="76" r="11" fill="#1E293B" />
            <rect x="145" y="88" width="18" height="26" rx="5" fill="#334155" />
            <circle cx="210" cy="72" r="11" fill="#334155" />
            <rect x="201" y="84" width="18" height="30" rx="5" fill="#475569" />
            <circle cx="266" cy="76" r="11" fill="#1E293B" />
            <rect x="257" y="88" width="18" height="26" rx="5" fill="#1E293B" />
            <rect x="186" y="104" width="48" height="10" fill="#F8FAFC" stroke="#475569" />
          </svg>
        );

      case 'tat_scene_09':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Stage and auditorium curtain'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <path d="M0 0 L120 0 Q92 90 108 180 L0 180 Z" fill="#475569" />
            <path d="M420 0 L320 0 Q345 90 330 180 L420 180 Z" fill="#475569" />
            <rect x="108" y="138" width="222" height="14" fill="#334155" />
            <circle cx="165" cy="82" r="12" fill="#1E293B" />
            <rect x="155" y="96" width="20" height="42" rx="5" fill="#1E293B" />
            <rect x="178" y="102" width="16" height="12" fill="#F8FAFC" stroke="#334155" />
            <line x1="230" y1="88" x2="230" y2="138" stroke="#334155" strokeWidth="3" />
            <circle cx="230" cy="84" r="5" fill="#1E293B" />
          </svg>
        );

      case 'tat_scene_10':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'Rural road breakdown'}>
            <rect width="420" height="180" fill="#E2E8F0" />
            <rect x="0" y="132" width="420" height="48" fill="#94A3B8" opacity="0.6" />
            <rect x="65" y="72" width="165" height="58" rx="8" fill="#475569" />
            <rect x="80" y="84" width="38" height="22" rx="2" fill="#CBD5E1" />
            <rect x="128" y="84" width="38" height="22" rx="2" fill="#CBD5E1" />
            <rect x="176" y="84" width="38" height="22" rx="2" fill="#CBD5E1" />
            <circle cx="102" cy="132" r="14" fill="#1E293B" />
            <circle cx="192" cy="132" r="14" fill="#1E293B" />
            <circle cx="268" cy="86" r="10" fill="#1E293B" />
            <rect x="261" y="97" width="14" height="35" rx="4" fill="#334155" />
            <circle cx="308" cy="90" r="10" fill="#334155" />
            <rect x="301" y="101" width="14" height="31" rx="4" fill="#475569" />
          </svg>
        );

      case 'tat_scene_11':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-100 border border-dashed border-slate-300" role="img" aria-label={caption || 'Open horizon reflective card'}>
            <rect width="420" height="180" fill="#F8FAFC" />
            <line x1="40" y1="126" x2="380" y2="126" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M168 126 A42 42 0 0 1 252 126" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
            <text x="210" y="68" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="600">
              PICTURE 11 · OPEN HORIZON CARD
            </text>
            <text x="210" y="88" textAnchor="middle" fill="#94A3B8" fontSize="11">
              Imagine your own inspiring real-life challenge &amp; solution
            </text>
          </svg>
        );

      // ==================== 12 MONTHLY PPDT SCENES ====================
      case 'ppdt_month_01':
      case 'ppdt_courtyard':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'January PPDT scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <rect x="30" y="25" width="120" height="80" rx="4" fill="#94A3B8" opacity="0.65" />
            <line x1="45" y1="45" x2="130" y2="45" stroke="#475569" strokeWidth="3" opacity="0.6" />
            <line x1="45" y1="62" x2="115" y2="62" stroke="#475569" strokeWidth="3" opacity="0.5" />
            {[200, 242, 285, 332].map((cx, i) => (
              <g key={cx} opacity={0.82 - i * 0.05}>
                <circle cx={cx} cy={76 + (i % 2) * 5} r={10} fill="#334155" />
                <rect x={cx - 7} y={88 + (i % 2) * 4} width="14" height="42" rx="5" fill="#475569" />
              </g>
            ))}
            <line x1="208" y1="100" x2="265" y2="85" stroke="#1E293B" strokeWidth="3" opacity="0.5" />
          </svg>
        );

      case 'ppdt_month_02':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'February PPDT riverbank scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <path d="M0 120 Q120 105 240 122 T420 118 L420 180 L0 180 Z" fill="#94A3B8" opacity="0.6" />
            <path d="M235 126 Q285 148 345 126 Z" fill="#334155" opacity="0.72" />
            {[115, 160, 205].map((cx, i) => (
              <g key={cx} opacity="0.75">
                <circle cx={cx} cy={78 + i * 3} r="10" fill="#334155" />
                <rect x={cx - 7} y={90 + i * 3} width="14" height="38" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_03':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'March PPDT chalkboard scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <rect x="220" y="22" width="165" height="72" rx="4" fill="#64748B" opacity="0.55" />
            <rect x="75" y="122" width="230" height="14" fill="#475569" opacity="0.7" />
            {[105, 145, 185, 228, 270].map((cx, i) => (
              <g key={cx} opacity="0.72">
                <circle cx={cx} cy={82 + (i % 2) * 4} r="9" fill="#334155" />
                <rect x={cx - 7} y={93 + (i % 2) * 4} width="14" height="29" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_04':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'April PPDT crossroads scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <path d="M180 180 L205 110 L235 180 Z" fill="#94A3B8" opacity="0.65" />
            <line x1="210" y1="35" x2="210" y2="128" stroke="#334155" strokeWidth="5" opacity="0.7" />
            <polygon points="210,44 272,44 282,53 272,62 210,62" fill="#475569" opacity="0.7" />
            <polygon points="210,68 152,68 142,77 152,86 210,86" fill="#64748B" opacity="0.7" />
            {[145, 275].map((cx) => (
              <g key={cx} opacity="0.75">
                <circle cx={cx} cy="92" r="10" fill="#334155" />
                <rect x={cx - 7} y="104" width="14" height="40" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_05':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'May PPDT village well scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <ellipse cx="210" cy="126" rx="48" ry="18" fill="#64748B" opacity="0.65" />
            <rect x="162" y="126" width="96" height="32" fill="#475569" opacity="0.65" />
            {[105, 148, 278, 320].map((cx) => (
              <g key={cx} opacity="0.72">
                <circle cx={cx} cy="84" r="10" fill="#334155" />
                <rect x={cx - 7} y="96" width="14" height="44" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_06':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'June PPDT railway platform scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <polygon points="20,42 400,42 365,20 55,20" fill="#475569" opacity="0.6" />
            <rect x="115" y="120" width="190" height="12" rx="3" fill="#475569" opacity="0.7" />
            {[145, 210, 268].map((cx) => (
              <g key={cx} opacity="0.76">
                <circle cx={cx} cy="84" r="10" fill="#334155" />
                <rect x={cx - 7} y="96" width="14" height="34" rx="5" fill="#475569" />
              </g>
            ))}
            <rect x="295" y="114" width="26" height="24" rx="3" fill="#64748B" opacity="0.7" />
          </svg>
        );

      case 'ppdt_month_07':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'July PPDT rain verandah scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <rect x="25" y="24" width="240" height="14" fill="#475569" opacity="0.65" />
            <line x1="255" y1="38" x2="255" y2="155" stroke="#475569" strokeWidth="6" opacity="0.65" />
            {[290, 320, 350, 380].map((x) => (
              <line key={x} x1={x} y1="25" x2={x - 18} y2="155" stroke="#64748B" strokeWidth="2" opacity="0.45" />
            ))}
            {[90, 140, 190].map((cx) => (
              <g key={cx} opacity="0.75">
                <circle cx={cx} cy="82" r="10" fill="#334155" />
                <rect x={cx - 7} y="94" width="14" height="44" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_08':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'August PPDT flagpole scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <line x1="210" y1="20" x2="210" y2="148" stroke="#334155" strokeWidth="4" opacity="0.75" />
            <rect x="212" y="24" width="44" height="26" fill="#64748B" opacity="0.65" />
            <rect x="175" y="140" width="70" height="16" fill="#475569" opacity="0.7" />
            {[115, 152, 268, 305].map((cx) => (
              <g key={cx} opacity="0.75">
                <circle cx={cx} cy="92" r="9" fill="#334155" />
                <rect x={cx - 7} y="103" width="14" height="39" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_09':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'September PPDT workshop scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <rect x="95" y="114" width="230" height="14" fill="#475569" opacity="0.75" />
            <circle cx="210" cy="96" r="16" fill="none" stroke="#334155" strokeWidth="5" opacity="0.65" />
            {[140, 210, 280].map((cx) => (
              <g key={cx} opacity="0.72">
                <circle cx={cx} cy="68" r="10" fill="#334155" />
                <rect x={cx - 8} y="80" width="16" height="34" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_10':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'October PPDT evening market scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <path d="M20 42 Q210 68 400 42" fill="none" stroke="#475569" strokeWidth="2" opacity="0.6" />
            {[90, 170, 250, 330].map((x) => (
              <circle key={x} cx={x} cy="56" r="7" fill="#F8FAFC" opacity="0.75" />
            ))}
            {[110, 175, 245, 310].map((cx, i) => (
              <g key={cx} opacity="0.75">
                <circle cx={cx} cy={88 + (i % 2) * 4} r="10" fill="#334155" />
                <rect x={cx - 7} y={100 + (i % 2) * 4} width="14" height="40" rx="5" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_11':
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'November PPDT campfire circle scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <polygon points="35,140 105,66 175,140" fill="#64748B" opacity="0.65" />
            <ellipse cx="268" cy="136" rx="22" ry="9" fill="#475569" opacity="0.7" />
            <polygon points="258,134 268,108 278,134" fill="#F8FAFC" opacity="0.7" />
            {[198, 232, 304, 338, 368].map((cx, i) => (
              <g key={cx} opacity="0.74">
                <circle cx={cx} cy={92 + (i % 2) * 4} r="9" fill="#334155" />
                <rect x={cx - 6} y={103 + (i % 2) * 4} width="12" height="32" rx="4" fill="#475569" />
              </g>
            ))}
          </svg>
        );

      case 'ppdt_month_12':
      default:
        return (
          <svg viewBox="0 0 420 180" className="w-full h-44 rounded bg-slate-200" role="img" aria-label={caption || 'December PPDT hilltop path scene'}>
            <rect width="420" height="180" fill="#CBD5E1" />
            <path d="M0 180 Q180 95 420 120 L420 180 Z" fill="#94A3B8" opacity="0.65" />
            <path d="M292 102 A28 28 0 0 1 348 102 Z" fill="#475569" opacity="0.7" />
            {[115, 168, 222].map((cx, i) => (
              <g key={cx} opacity="0.76">
                <circle cx={cx} cy={112 - i * 8} r="9" fill="#334155" />
                <rect x={cx - 6} y={122 - i * 8} width="12" height="32" rx="4" fill="#475569" />
              </g>
            ))}
          </svg>
        );
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 space-y-2">
      {renderSvg()}
      {caption && <p className="text-xs text-slate-600 italic">{caption}</p>}
    </div>
  );
};
