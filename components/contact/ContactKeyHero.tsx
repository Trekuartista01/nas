"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { BlockButton } from "@/components/ui/Buttons";
import { LogoMark } from "@/components/ui/Logo";
import { useReducedMotionSafe } from "@/components/motion/useMotionScale";

interface ContactKeyHeroProps {
  title?: string;
  /** E.164, for tel: ("+38344155662"). */
  phone: string;
  phoneDisplay: string;
  /** Null = not known yet: the tag shows "[EMAIL]" without a link. */
  email: string | null;
  /** Digits only, for wa.me ("38344155662"). */
  whatsapp: string;
  mapsUrl: string;
  /** How far down (px) the tag has to be pulled to open the form. */
  pullThreshold?: number;
  /** Id of the form section the pull (or Enter / Space on the tag) scrolls to. */
  formId?: string;
}

/* Geometry (px, in the scene). The hook's pivot sits HOOK_Y below the scene top. */
const HOOK_Y = 30;
/** Chain length, hook pivot → ring centre. */
const L = 170;
/** Most the chain stretches while dragged. */
const MAX_STRETCH = 46;
/** Rest angles of the key and the tag on the ring (they hang splayed apart). */
const KEY_REST = 9;
const TAG_REST = -16;
/** Tag centre below the ring, for the cursor-proximity push. */
const TAG_DROP = 110;
/** Pointer travel (px) before a press counts as a drag (and its click is dropped). */
const DRAG_START = 6;
/** Key shadow on the wall: offset (px) and strength. */
const SHADOW_X = 10;
const SHADOW_Y = 18;
const SHADOW_OPACITY = 0.35;

const CHAMFER = "polygon(21px 0, 100% 0, 100% 15px, calc(100% - 21px) 100%, 0 100%, 0 29px)";

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const DEG = 180 / Math.PI;

interface Sim {
  a: number; // chain angle (deg); positive = bottom swings left
  va: number;
  prevVa: number;
  b: number; // tag, relative to the ring
  vb: number;
  c: number; // key, relative to the ring
  vc: number;
  s: number; // chain stretch (px)
  vs: number;
  turn: number; // key "click" (0 → 1)
  vturn: number;
  turnTarget: number;
  tilt: number; // device tilt (deg)
  drag: null | { a: number; s: number; aOff: number; r0: number; y0: number };
}

/**
 * /kontakti hero: KONTAKTI on the left; on the right a workshop shadow board (tool outlines, an empty
 * dashed outline where the key belongs, one spotlight) with a motorbike key and red tag hanging from a
 * hook, casting a live shadow on the wall. Hand-written spring physics in one rAF loop (paused off-screen and in hidden tabs):
 * idle sway, a push from a fast cursor nearby, device tilt on phones, drag with a stretchy chain
 * and an overshooting release. Pulling the tag down past `pullThreshold` (or Enter / Space on it)
 * "turns" the key and scrolls to the contact form. Phone / email on the tag are real links; a drag
 * never fires them. Only transforms change per frame, written straight to the elements.
 * Reduced motion: the key hangs still, the tag is a plain button.
 */
export default function ContactKeyHero({
  title = "KONTAKTI",
  phone,
  phoneDisplay,
  email,
  whatsapp,
  mapsUrl,
  pullThreshold = 120,
  formId = "na-shkruaj",
}: ContactKeyHeroProps) {
  const reduce = useReducedMotionSafe();
  const heroRef = useRef<HTMLElement>(null);
  const pivotRef = useRef<HTMLDivElement>(null);
  /** The scaled scene: the real key and its two shadow copies are found in it by data-part. */
  const sceneRef = useRef<HTMLDivElement>(null);
  const sim = useRef<Sim>({
    a: 0,
    va: 0,
    prevVa: 0,
    b: 0,
    vb: 0,
    c: 0,
    vc: 0,
    s: 0,
    vs: 0,
    turn: 0,
    vturn: 0,
    turnTarget: 0,
    tilt: 0,
    drag: null,
  });
  const justDragged = useRef(false);
  const opening = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });
  const askedTilt = useRef(false);
  const tiltHandler = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const [touched, setTouched] = useState(false);

  /** Hook pivot in client coordinates (a layout read: only from event handlers, never the loop). */
  const hookPoint = () => {
    // A zero-size marker at the pivot, so the desktop scale-up needs no maths here.
    const r = pivotRef.current!.getBoundingClientRect();
    return { x: r.left, y: r.top };
  };

  const openForm = useCallback(() => {
    if (opening.current) return;
    opening.current = true;
    setTouched(true);
    sim.current.turnTarget = 1;
    window.setTimeout(
      () => {
        sim.current.turnTarget = 0;
        const form = document.getElementById(formId);
        form?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        window.setTimeout(
          () => {
            form?.querySelector<HTMLElement>("input:not([type=hidden]), textarea")?.focus({ preventScroll: true });
            opening.current = false;
          },
          reduce ? 0 : 700,
        );
      },
      reduce ? 0 : 380,
    );
  }, [formId, reduce]);

  /* ───── the loop ───── */
  useEffect(() => {
    if (reduce) return;
    const st = sim.current;
    let raf = 0;
    let running = false;
    let last = 0;
    let inView = true;

    // Collected once: the real key + the two shadow copies share the same parts. Kept as plain
    // element lists so a frame that lands after React detached the refs can't crash.
    const root = sceneRef.current;
    if (!root) return;
    const all = (part: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-part="${part}"]`));
    const parts = { swing: all("swing"), chain: all("chain"), ring: all("ring"), key: all("key"), tag: all("tag") };
    const sharp = root.querySelector<HTMLElement>('[data-shadow="sharp"]');
    const soft = root.querySelector<HTMLElement>('[data-shadow="soft"]');
    const set = (els: HTMLElement[], t: string) => {
      for (const el of els) el.style.transform = t;
    };

    const render = () => {
      if (!root.isConnected) return;
      set(parts.swing, `rotate(${st.a}deg)`);
      set(parts.chain, `scaleY(${(L + st.s) / L})`);
      set(parts.ring, `translateY(${st.s}px)`);
      set(parts.key, `rotate(${KEY_REST + st.c - 32 * st.turn}deg)`);
      set(parts.tag, `rotate(${TAG_REST + st.b}deg)`);
      // Live shadow: light slightly above-left, so it sits down-right and slides with the swing; pulled
      // away from the wall it drifts further, grows and goes softer (cross-fade to the blurrier copy).
      const pull = st.s / MAX_STRETCH;
      const shadow = `translate(${SHADOW_X + st.a * 0.35 + st.s * 0.3}px, ${SHADOW_Y + Math.abs(st.a) * 0.12 + st.s * 0.45}px) scale(${1 + st.s / 420})`;
      if (sharp) {
        sharp.style.transform = shadow;
        sharp.style.opacity = String(SHADOW_OPACITY * (1 - pull));
      }
      if (soft) {
        soft.style.transform = shadow;
        soft.style.opacity = String(SHADOW_OPACITY * pull);
      }
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = now / 1000;
      if (dt > 0) {
        const idle = 2.4 * Math.sin(t * 1.1) + 0.7 * Math.sin(t * 0.37);
        if (st.drag) {
          // Follow the pointer quickly (no teleport), keep the angular speed for the release.
          const prev = st.a;
          st.a += (st.drag.a - st.a) * Math.min(1, dt * 22);
          // Capped, so a flick releases into a believable swing.
          st.va = clamp((st.a - prev) / dt, -180, 180);
          st.s += (st.drag.s - st.s) * Math.min(1, dt * 22);
          st.vs = 0;
        } else {
          st.va += (-12 * (st.a - (idle - st.tilt)) - 2.1 * st.va) * dt;
          st.a = clamp(st.a + st.va * dt, -60, 60);
          if (Math.abs(st.a) === 60) st.va *= -0.3;
          // Low damping: the chain overshoots when it snaps back.
          st.vs += (-140 * st.s - 7 * st.vs) * dt;
          st.s += st.vs * dt;
        }
        // The key and tag lag behind the chain's angular acceleration, then settle on the ring.
        const aAcc = clamp((st.va - st.prevVa) / dt, -2500, 2500);
        st.prevVa = st.va;
        st.vb += (-16 * st.b - 2.3 * st.vb - 0.5 * aAcc) * dt;
        st.b = clamp(st.b + st.vb * dt, -38, 38);
        st.vc += (-24 * st.c - 2.8 * st.vc - 0.4 * aAcc) * dt;
        st.c = clamp(st.c + st.vc * dt, -30, 30);
        st.vturn += (-170 * (st.turn - st.turnTarget) - 15 * st.vturn) * dt;
        st.turn += st.vturn * dt;
        render();
      }
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(heroRef.current!);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    // Device tilt (Android and desktop browsers that have it; iOS asks on the first touch of the tag).
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      st.tilt += (clamp(e.gamma * 0.5, -16, 16) - st.tilt) * 0.2;
    };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const needsPermission = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function";
    if (coarse && !needsPermission && "DeviceOrientationEvent" in window) window.addEventListener("deviceorientation", onTilt);
    tiltHandler.current = onTilt;

    start();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [reduce]);

  /* ───── cursor push (mouse only) ───── */
  const onHeroPointerMove = (e: ReactPointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || sim.current.drag) return;
    const now = performance.now();
    const m = lastMouse.current;
    const dts = (now - m.t) / 1000;
    lastMouse.current = { x: e.clientX, y: e.clientY, t: now };
    if (dts <= 0 || dts > 0.1) return;
    const vx = (e.clientX - m.x) / dts;
    const vy = (e.clientY - m.y) / dts;
    if (Math.hypot(vx, vy) < 350) return;
    const st = sim.current;
    const h = hookPoint();
    const rad = st.a / DEG;
    const cx = h.x - Math.sin(rad) * (L + TAG_DROP);
    const cy = h.y + Math.cos(rad) * (L + TAG_DROP);
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist > 240) return;
    // Bottom moving right = negative angle.
    st.va += clamp(-vx * 0.022 * (1 - dist / 240), -70, 70);
  };

  /* ───── drag + pull ───── */
  const onTagPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    setTouched(true);
    // iOS: motion access needs a user gesture; ask once, quietly fall back to idle sway.
    if (!reduce && e.pointerType === "touch" && !askedTilt.current) {
      askedTilt.current = true;
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      const onTilt = tiltHandler.current;
      if (typeof DOE.requestPermission === "function" && onTilt) {
        DOE.requestPermission()
          .then((r) => r === "granted" && window.addEventListener("deviceorientation", onTilt))
          .catch(() => {});
      }
    }
    if (reduce) return;

    const st = sim.current;
    const x0 = e.clientX;
    const y0 = e.clientY;
    let dragging = false;

    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < DRAG_START) return;
        dragging = true;
        const h = hookPoint();
        const angle = -Math.atan2(x0 - h.x, y0 - h.y) * DEG;
        st.drag = {
          a: st.a,
          s: st.s,
          aOff: st.a - angle,
          r0: Math.hypot(x0 - h.x, y0 - h.y),
          y0,
        };
      }
      const d = st.drag!;
      const h = hookPoint();
      const dx = ev.clientX - h.x;
      const dy = ev.clientY - h.y;
      d.a = clamp(-Math.atan2(dx, dy) * DEG + d.aOff, -55, 55);
      const raw = Math.max(0, Math.hypot(dx, dy) - d.r0);
      d.s = MAX_STRETCH * Math.tanh(raw / MAX_STRETCH);
      if (ev.clientY - d.y0 > pullThreshold) {
        end();
        openForm();
      }
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (dragging) {
        justDragged.current = true;
        window.setTimeout(() => (justDragged.current = false), 0);
      }
      st.drag = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  /** A drag that ends over a link must not open it. */
  const onTagClickCapture = (e: React.MouseEvent) => {
    if (justDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const action = "[&_a]:h-12 [&_a]:px-6 [&_a]:text-[13px]";

  return (
    <section ref={heroRef} onPointerMove={onHeroPointerMove} className="relative overflow-hidden bg-[#0c0c0c]">
      <Wall />
      <div className="container-moto relative grid min-h-[85svh] gap-6 pb-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pb-12">
        {/* Title block */}
        <div className="relative self-center pt-14 lg:pt-0">
          <h1 className="wide relative text-[44px] font-black italic uppercase leading-none tracking-[-0.03em] sm:text-[64px] lg:text-[92px]">{title}</h1>
          <p className="relative mt-6 max-w-[420px] text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-light">Na shkruaj, na telefono, ose tërhiq çelësin.</p>
        </div>

        {/* Key scene (hook at the top of the hero) + quick actions */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-[460px] w-full max-w-[440px] select-none lg:h-[600px]">
            <ToolBoard />
            <Spotlight />
            {/* 1.3× on desktop; the physics works in client px via the pivot marker. */}
            <div ref={sceneRef} className="absolute inset-0 origin-top lg:scale-[1.3]">
              <EmptyKeyOutline />
              <KeyShadow kind="sharp" />
              <KeyShadow kind="soft" />
              <Hook />
              <div ref={pivotRef} aria-hidden className="absolute left-1/2" style={{ top: HOOK_Y }} />
              {/* Everything below the hook swings from its pivot. */}
              <div data-part="swing" className="absolute left-1/2 top-[30px] w-0 origin-top" style={{ transform: "rotate(0deg)" }}>
                <div data-part="chain" className="absolute -left-[7px] top-0 origin-top" style={{ height: L }}>
                  <Chain />
                </div>
                <div data-part="ring" className="absolute left-0" style={{ top: L }}>
                  <Ring />
                  {/* Key: hangs from the ring by the hole in its head. */}
                  <div
                    data-part="key"
                    className="absolute -left-[32px] top-[2px] h-[200px] w-[64px] origin-[32px_8px]"
                    style={{ transform: `rotate(${KEY_REST}deg)` }}
                  >
                    <KeySvg />
                    <LogoMark bare className="absolute left-1/2 top-[34px] h-auto w-[34px] -translate-x-1/2 text-white/85" />
                  </div>
                  {/* Tag: on a short cord from the ring, beside the key. */}
                  <div
                    data-part="tag"
                    onPointerDown={onTagPointerDown}
                    onClickCapture={onTagClickCapture}
                    className="absolute left-0 top-0 origin-top-left touch-none"
                    style={{ transform: `rotate(${TAG_REST}deg)` }}
                  >
                    <svg aria-hidden width="4" height="30" className="absolute -left-[2px] top-0" viewBox="0 0 4 30">
                      <line x1="2" y1="0" x2="2" y2="30" stroke="#8a8a8a" strokeWidth="1.5" />
                    </svg>
                    <div
                      style={{ clipPath: CHAMFER }}
                      className="absolute -left-[26px] top-[28px] flex h-[146px] w-[236px] cursor-grab flex-col justify-center bg-red pl-8 pr-6 text-white drop-shadow-[0_14px_14px_rgba(0,0,0,.55)] active:cursor-grabbing"
                    >
                      {/* The whole tag is the button; the links sit above it. */}
                      <button
                        type="button"
                        aria-label="Hap formularin e kontaktit"
                        onClick={() => {
                          if (!justDragged.current) openForm();
                        }}
                        className="absolute inset-0 cursor-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
                      />
                      <span aria-hidden className="pointer-events-none relative text-[11px] font-extrabold tracking-[0.3em]">
                        NAS
                      </span>
                      <a
                        href={`tel:${phone}`}
                        draggable={false}
                        className="relative mt-1 w-fit text-[26px] font-extrabold italic leading-tight text-white hover:text-white hover:underline"
                      >
                        {phoneDisplay}
                      </a>
                      {email ? (
                        <a
                          href={`mailto:${email}`}
                          draggable={false}
                          className="relative mt-1 w-fit text-[13px] text-white/90 hover:text-white hover:underline"
                        >
                          {email}
                        </a>
                      ) : (
                        <span className="pointer-events-none relative mt-1 text-[13px] text-white/90">[EMAIL]</span>
                      )}
                    </div>
                    {/* Hint: fades after the first touch. */}
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute left-[222px] top-[150px] whitespace-nowrap text-[13px] font-bold tracking-[0.12em] text-white/70 transition-opacity duration-500 ${touched ? "opacity-0" : "opacity-100"}`}
                    >
                      ↓ Tërhiq
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex flex-wrap justify-center gap-3 ${action}`}>
            <BlockButton href={`tel:${phone}`} marks={false}>
              Telefono
            </BlockButton>
            <BlockButton href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" marks={false}>
              WhatsApp
            </BlockButton>
            <BlockButton href={mapsUrl} target="_blank" rel="noreferrer" marks={false}>
              Na vizito
            </BlockButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SVG parts ───────────────────────── */

const METAL = "url(#key-metal)";

/** Shared gradients (rendered once, inside the hook). */
function Defs() {
  return (
    <defs>
      <linearGradient id="key-metal" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#6d6d6d" />
        <stop offset=".45" stopColor="#e9e9e9" />
        <stop offset=".6" stopColor="#bdbdbd" />
        <stop offset="1" stopColor="#5b5b5b" />
      </linearGradient>
      <linearGradient id="key-rubber" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#2b2b2b" />
        <stop offset="1" stopColor="#0b0b0b" />
      </linearGradient>
    </defs>
  );
}

/** Wall plate + hook; the pivot is the bottom of the hook's curve (HOOK_Y). */
function Hook() {
  return (
    <svg aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2" width="60" height="40" viewBox="0 0 60 40">
      <Defs />
      <rect x="14" y="0" width="32" height="10" rx="2" fill="#1f1f1f" stroke="#333" />
      <circle cx="20" cy="5" r="1.6" fill="#555" />
      <circle cx="40" cy="5" r="1.6" fill="#555" />
      <path d="M30 10 V22 a8 8 0 1 0 8 -8" fill="none" stroke={METAL} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Five links, alternating face-on and edge-on. Scales with the stretch (origin top). */
function Chain() {
  const n = 5;
  const h = L / n;
  return (
    <svg aria-hidden width="14" height={L} viewBox={`0 0 14 ${L}`} preserveAspectRatio="none" className="block h-full">
      {Array.from({ length: n }, (_, i) =>
        i % 2 === 0 ? (
          <ellipse key={i} cx="7" cy={h * i + h / 2} rx="5" ry={h / 2 + 2} fill="none" stroke={METAL} strokeWidth="2.4" />
        ) : (
          <rect key={i} x="5.6" y={h * i - 3} width="2.8" height={h + 6} rx="1.4" fill="#cfcfcf" />
        ),
      )}
    </svg>
  );
}

/** Split key ring, centred on the chain end. */
function Ring() {
  return (
    <svg aria-hidden className="absolute -left-[16px] -top-[16px]" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="12" fill="none" stroke={METAL} strokeWidth="3" />
      <path d="M7 9 a12 12 0 0 1 6 -4.5" fill="none" stroke="#f2f2f2" strokeWidth="1.2" />
    </svg>
  );
}

/** Ignition key: black rubber head with the hole at (32, 8), metal collar, notched blade. */
function KeySvg() {
  return (
    <svg aria-hidden width="64" height="200" viewBox="0 0 64 200" className="absolute inset-0 drop-shadow-[0_12px_10px_rgba(0,0,0,.55)]">
      <path d="M10 0 H54 a10 10 0 0 1 10 10 V62 a16 16 0 0 1 -16 16 H16 a16 16 0 0 1 -16 -16 V10 a10 10 0 0 1 10 -10 Z" fill="url(#key-rubber)" stroke="#333" />
      <circle cx="32" cy="8" r="5" fill="#0a0a0a" stroke="#444" />
      <rect x="20" y="76" width="24" height="10" rx="2" fill={METAL} />
      <path d="M25 86 H39 V176 L35 184 V196 H29 V188 L25 182 V168 L28 164 L25 160 V146 L28 142 L25 138 Z" fill={METAL} stroke="#7a7a7a" strokeWidth=".6" />
      <line x1="32" y1="90" x2="32" y2="180" stroke="#8d8d8d" strokeWidth="1" />
    </svg>
  );
}

/* ───────────────────────── Shadow board (background) ───────────────────────── */

/** Faint painted-concrete grain + a vignette towards every edge. */
function Wall() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-[.045]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_62%_40%,transparent_35%,rgba(0,0,0,.7))]" />
    </div>
  );
}

/**
 * One overhead light on the key: a soft pool plus a faint cone from the top edge. Drawn over the tool
 * outlines (under the key), so the outlines in the light read brighter without a second copy.
 * Starts like a fluorescent tube (a few dips in the first 0.8s); the global reduced-motion rule skips it.
 */
function Spotlight() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 animate-[spot-flicker_.8s_linear_both]">
      <div className="absolute -top-10 left-0 h-[620px] w-[620px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,236,210,.06),transparent_85%)] [clip-path:polygon(47%_0,53%_0,100%_100%,0_100%)] lg:h-[780px] lg:w-[780px]" />
      <div className="absolute left-0 top-10 h-[640px] w-[640px] -translate-x-1/2 bg-[radial-gradient(circle_at_50%_34%,rgba(255,236,210,.13),rgba(255,236,210,.04)_35%,transparent_62%)] lg:top-16 lg:h-[920px] lg:w-[920px]" />
    </div>
  );
}

const TOOL_STROKE = { fill: "none", stroke: "#2a2a2a", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, strokeLinejoin: "round" as const };

interface ToolSpot {
  /** Centre x (px from the key) and top y (px from the hook plate), desktop. */
  d: [number, number];
  /** Same on phones (drawn at 75%); left out = desktop only. */
  m?: [number, number];
  w: number;
  h: number;
  children: ReactNode;
}

/** A painted tool outline with its peg, placed around the key. */
function Tool({ d, m, w, h, children }: ToolSpot) {
  const vars = { "--x": `${d[0]}px`, "--y": `${d[1]}px`, "--mx": `${m?.[0] ?? 0}px`, "--my": `${m?.[1] ?? 0}px` } as CSSProperties;
  return (
    <div
      style={vars}
      className={`absolute left-[calc(50%+var(--mx))] top-(--my) origin-top -translate-x-1/2 scale-75 lg:left-[calc(50%+var(--x))] lg:top-(--y) lg:scale-100 ${m ? "" : "hidden lg:block"}`}
    >
      <span className="absolute -top-3.5 left-1/2 size-[7px] -translate-x-1/2 rounded-full border-[1.5px] border-[#2a2a2a]" />
      <svg width={w + 4} height={h + 4} viewBox={`-2 -2 ${w + 4} ${h + 4}`} className="block">
        <g {...TOOL_STROKE}>{children}</g>
      </svg>
    </div>
  );
}

/**
 * The workshop board: tool outlines in a neat grid around the key (x is px from the key, so it stays
 * arranged at any width). Fades out towards the title on desktop. Phones keep three tools.
 */
function ToolBoard() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 h-[760px] w-[1000px] -translate-x-1/2 lg:[mask-image:linear-gradient(90deg,transparent_6%,#000_32%)]"
    >
      {/* Combination wrench */}
      <Tool d={[-330, 40]} m={[-140, 30]} w={44} h={230}>
        <path d="M10 6 L16 6 L16 20 Q22 26 28 20 L28 6 L34 6 Q42 30 30 44 L30 186 Q42 192 40 208 Q36 228 22 228 Q8 228 4 208 Q2 192 14 186 L14 44 Q2 30 10 6 Z" />
        <polygon points="29,208 25.5,214.1 18.5,214.1 15,208 18.5,201.9 25.5,201.9" />
      </Tool>
      {/* Screwdriver */}
      <Tool d={[-200, 40]} m={[-140, 240]} w={30} h={230}>
        <path d="M6 12 Q6 2 15 2 Q24 2 24 12 L25 84 Q25 92 18 92 L18 212 L15 226 L12 212 L12 92 Q5 92 5 84 Z" />
        <path d="M11 16 V78 M15 16 V78 M19 16 V78" />
      </Tool>
      {/* Socket wrench (ratchet) */}
      <Tool d={[-330, 330]} w={60} h={230}>
        <circle cx="30" cy="30" r="24" />
        <rect x="24" y="24" width="12" height="12" />
        <path d="M23 53 L23 216 Q23 226 30 226 Q37 226 37 216 L37 53" />
      </Tool>
      {/* Spark plug */}
      <Tool d={[-200, 340]} m={[125, 20]} w={36} h={150}>
        <rect x="13" y="1" width="10" height="11" rx="2" />
        <path d="M11 12 L25 12 L27 70 L9 70 Z M10 26 H26 M10 40 H26 M9.5 54 H26.5" />
        <rect x="4" y="70" width="28" height="18" />
        <rect x="9" y="88" width="18" height="40" />
        <path d="M9 96 H27 M9 104 H27 M9 112 H27 M9 120 H27 M18 128 V142 H27" />
      </Tool>
      {/* Tyre pressure gauge */}
      <Tool d={[150, 30]} w={80} h={170}>
        <circle cx="40" cy="40" r="34" />
        <circle cx="40" cy="40" r="3" />
        <path d="M40 40 L58 24 M16 40 H21 M40 16 V21 M64 40 H59 M23 23 L27 27 M57 23 L53 27" />
        <path d="M40 74 Q40 118 58 136 Q70 148 70 158" />
        <rect x="64" y="158" width="12" height="10" />
      </Tool>
      {/* Mirror */}
      <Tool d={[292, 14]} w={90} h={180}>
        <ellipse cx="45" cy="34" rx="40" ry="30" />
        <ellipse cx="45" cy="34" rx="33" ry="23" />
        <path d="M45 64 Q38 100 48 128 L48 168" />
        <rect x="40" y="168" width="16" height="10" />
      </Tool>
      {/* Chain link */}
      <Tool d={[-265, 610]} w={130} h={50}>
        <rect x="2" y="8" width="76" height="34" rx="17" />
        <rect x="52" y="8" width="76" height="34" rx="17" />
        <circle cx="19" cy="25" r="5" />
        <circle cx="65" cy="25" r="5" />
        <circle cx="111" cy="25" r="5" />
      </Tool>
      {/* Oil can */}
      <Tool d={[210, 580]} w={110} h={106}>
        <path d="M8 50 L72 50 L76 104 L4 104 Z M22 50 L28 36 L52 36 L58 50" />
        <rect x="34" y="28" width="12" height="8" />
        <path d="M72 60 L106 22 L108 28 L76 70 M8 60 Q-4 76 6 92" />
      </Tool>
    </div>
  );
}

/** The key's silhouette (head, collar, blade) in the KeySvg box. */
const KEY_SILHOUETTE =
  "M10 0 H54 a10 10 0 0 1 10 10 V62 a16 16 0 0 1 -16 16 H44 V86 H39 V176 L35 184 V196 H29 V188 L25 182 V168 L28 164 L25 160 V146 L28 142 L25 138 V86 H20 V78 H16 a16 16 0 0 1 -16 -16 V10 a10 10 0 0 1 10 -10 Z";
const DASHED = {
  fill: "none",
  stroke: "#E10600",
  strokeOpacity: 0.35,
  strokeWidth: 1.5,
  strokeDasharray: "5 4",
  vectorEffect: "non-scaling-stroke" as const,
};

/** "Where the key belongs": dashed red outline of the key + tag at rest (drawn a little larger, so it frames them), and its label. */
function EmptyKeyOutline() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[30px] w-0">
      <div className="absolute left-0" style={{ top: L }}>
        <div className="absolute -left-[32px] top-[2px] h-[200px] w-[64px] origin-[32px_8px]" style={{ transform: `rotate(${KEY_REST}deg) scale(1.12)` }}>
          <svg viewBox="0 0 64 200" className="absolute inset-0 size-full overflow-visible">
            <path d={KEY_SILHOUETTE} {...DASHED} />
          </svg>
        </div>
        <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `rotate(${TAG_REST}deg)` }}>
          <svg width="248" height="158" viewBox="0 0 248 158" className="absolute -left-[32px] top-[22px] overflow-visible">
            <polygon points="21,0.75 247.25,0.75 247.25,15 227,157.25 0.75,157.25 0.75,29" {...DASHED} />
          </svg>
        </div>
        <span className="absolute -left-[100px] top-[232px] w-[160px] text-center text-[11px] font-extrabold uppercase tracking-[0.3em] text-red/80">
          Çelësi — tërhiqe
        </span>
      </div>
    </div>
  );
}

/**
 * The key's shadow on the wall: the same chain / ring / key / tag, flattened to black and blurred.
 * Driven by the same physics (the loop writes the same transforms to every data-part). Two copies,
 * sharp and soft, cross-faded by the pull so the blur itself never animates.
 */
function KeyShadow({ kind }: { kind: "sharp" | "soft" }) {
  return (
    <div
      aria-hidden
      data-shadow={kind}
      className={`pointer-events-none absolute inset-0 ${kind === "sharp" ? "[filter:brightness(0)_blur(6px)]" : "[filter:brightness(0)_blur(10px)]"}`}
      style={{ transform: `translate(${SHADOW_X}px, ${SHADOW_Y}px)`, opacity: kind === "sharp" ? SHADOW_OPACITY : 0 }}
    >
      <div data-part="swing" className="absolute left-1/2 top-[30px] w-0 origin-top">
        <div data-part="chain" className="absolute -left-[7px] top-0 origin-top" style={{ height: L }}>
          <Chain />
        </div>
        <div data-part="ring" className="absolute left-0" style={{ top: L }}>
          <Ring />
          <div
            data-part="key"
            className="absolute -left-[32px] top-[2px] h-[200px] w-[64px] origin-[32px_8px]"
            style={{ transform: `rotate(${KEY_REST}deg)` }}
          >
            <KeySvg />
          </div>
          <div data-part="tag" className="absolute left-0 top-0 origin-top-left" style={{ transform: `rotate(${TAG_REST}deg)` }}>
            <div style={{ clipPath: CHAMFER }} className="absolute -left-[26px] top-[28px] h-[146px] w-[236px] bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
