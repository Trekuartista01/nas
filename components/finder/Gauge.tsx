"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const CX = 150;
const CY = 150;
const R = 120;
const ARC = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;
const ARC_LEN = Math.PI * R;
const NEEDLE = 96; // stays inside the tick ring

// Rounded to 0.01px: server and browser trig can differ in the last decimal, which breaks hydration.
const r2 = (n: number) => Math.round(n * 100) / 100;

function makeTicks(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => {
  const a = Math.PI * (1 - i / max);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    i,
    x1: r2(CX + 104 * cos),
    y1: r2(CY - 104 * sin),
    x2: r2(CX + 96 * cos),
    y2: r2(CY - 96 * sin),
    lx: r2(CX + 82 * cos),
    ly: r2(CY - 82 * sin + 4),
  };
  });
}

// Red zone: last quarter of the dial.
const RED_START = Math.PI * 0.25;
const RED_ARC = `M${r2(CX + R * Math.cos(RED_START))} ${r2(CY - R * Math.sin(RED_START))} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/**
 * Rev-counter: needle + arc show how many models match (value / max).
 * Needle and arc are driven by ONE spring so they always point at the same spot.
 */
export default function Gauge({ value, max }: { value: number; max: number }) {
  const target = max ? value / max : 0;
  const ticks = makeTicks(Math.max(1, max));
  const p = useSpring(target, { stiffness: 140, damping: 24, mass: 0.8 }); // critically damped-ish: no wobble
  useEffect(() => p.set(target), [p, target]);

  const dashOffset = useTransform(p, (v) => ARC_LEN * (1 - v));
  const needleX = useTransform(p, (v) => CX - NEEDLE * Math.cos(Math.PI * v));
  const needleY = useTransform(p, (v) => CY - NEEDLE * Math.sin(Math.PI * v));

  return (
    <div className="mx-auto w-full max-w-[380px]">
      <svg viewBox="0 0 300 166" className="block w-full" role="img" aria-label={`${value} nga ${max} modele të përshtaten`}>
        <path d={ARC} fill="none" stroke="#1f1f1f" strokeWidth={16} />
        <path d={RED_ARC} fill="none" stroke="var(--color-red)" strokeOpacity={0.35} strokeWidth={16} />
        <motion.path
          d={ARC}
          fill="none"
          stroke="var(--color-highlight)"
          strokeWidth={16}
          strokeDasharray={ARC_LEN}
          style={{ strokeDashoffset: dashOffset }}
        />
        {ticks.map((t) => (
          <g key={t.i}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#6f6f6f" strokeWidth={2} />
            <text x={t.lx} y={t.ly} fill="#6f6f6f" fontSize={max > 12 ? 9 : 11} fontWeight={700} textAnchor="middle">
              {t.i}
            </text>
          </g>
        ))}
        <motion.line x1={CX} y1={CY} x2={needleX} y2={needleY} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={10} fill="var(--color-red)" />
        <circle cx={CX} cy={CY} r={3.5} fill="var(--color-ink)" />
      </svg>
      <div className="mt-2 text-center">
        <div className="wide text-[54px] font-black leading-none text-highlight tabular-nums">
          {value}
          <span className="text-lg text-[#6f6f6f]">/{max}</span>
        </div>
        <div className="mt-1.5 text-[11px] tracking-[0.2em] text-faint">MODELE PËR TY</div>
      </div>
    </div>
  );
}
