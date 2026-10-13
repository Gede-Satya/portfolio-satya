"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface LanyardBadgeProps {
  profile?: {
    name?: string;
    title?: string;
    avatar?: string;
    location?: string;
  };
  lang: "id" | "en";
  heroStats?: unknown;
}

export const LanyardBadge: React.FC<LanyardBadgeProps> = ({
  profile,
  lang,
}) => {
  // Data profil dari storage / default
  const fullName = profile?.name || "Gede Satya Budi Dharma Wiguna";
  const title = profile?.title || "Web Developer";
  const location = profile?.location || "Bali, Denpasar";
  const avatar = profile?.avatar || "/uploads/foto_wasit_satya-1791865121487.png";

  // State interaksi: petunjuk drag hilang setelah sentuhan pertama
  const [hasInteracted, setHasInteracted] = useState(false);

  // DOM refs untuk manipulasi animasi 60/120fps langsung tanpa re-render React
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftStrapRef = useRef<SVGPathElement>(null);
  const rightStrapRef = useRef<SVGPathElement>(null);
  const leftStrapShadowRef = useRef<SVGPathElement>(null);
  const rightStrapShadowRef = useRef<SVGPathElement>(null);
  const leftStrapStitchRef = useRef<SVGPathElement>(null);
  const rightStrapStitchRef = useRef<SVGPathElement>(null);
  const stopperGroupRef = useRef<SVGGElement>(null);

  // Status fisika pegas & gerak sekunder tali
  const physics = useRef({
    x: 0,
    y: 0,
    sx: 0, // Posisi sekunder tali untuk efek lentur (lag elastis halus)
    vx: 0,
    vy: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    targetX: 0,
    targetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initCardX: 0,
    initCardY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
    pointerVx: 0,
    pointerVy: 0,
  });

  const isVisibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Konstanta fisika pegas
  const SPRING_K = 0.045;
  const DAMPING = 0.88;
  const MAX_RADIUS = 130;

  // Koordinat geometris tali lanyard polos (lebar kontainer 320px)
  // Bahu Kiri: (100, 24), Bahu Kanan: (220, 24)
  // Titik temu tali awal (V-junction): (160, 185)
  // Jarak vertikal dari junction ke pusat cincin pengait kartu: tepat 62px
  const SHOULDER_LEFT_X = 100;
  const SHOULDER_RIGHT_X = 220;
  const SHOULDER_Y = 24;
  const BASE_JUNCTION_X = 160;
  const BASE_JUNCTION_Y = 185;
  const HOOK_OFFSET_Y = 62; // Dari junction ke pusat lubang punch kartu

  // Tulis transformasi langsung ke DOM tanpa re-render React
  const applyTransform = (x: number, y: number, sx: number, rx: number, ry: number, rz: number) => {
    // 1. Posisi junction tali yang mengikuti drag
    const junctionX = BASE_JUNCTION_X + x;
    const junctionY = BASE_JUNCTION_Y + y;

    // 2. Pusat cincin pengait (Hook Ring) dalam koordinat SVG
    const hookAngle = rz * 0.85;

    // 3. Tali kiri & kanan menggunakan kurva ketegangan elastis alami (taut tension)
    const leftMidX = (SHOULDER_LEFT_X + junctionX) / 2 + sx * 0.14;
    const leftMidY = (SHOULDER_Y + junctionY) / 2;
    const rightMidX = (SHOULDER_RIGHT_X + junctionX) / 2 + sx * 0.14;
    const rightMidY = (SHOULDER_Y + junctionY) / 2;

    const leftPath = `M ${SHOULDER_LEFT_X} ${SHOULDER_Y} Q ${leftMidX} ${leftMidY} ${junctionX - 6} ${junctionY}`;
    const rightPath = `M ${SHOULDER_RIGHT_X} ${SHOULDER_Y} Q ${rightMidX} ${rightMidY} ${junctionX + 6} ${junctionY}`;

    leftStrapRef.current?.setAttribute("d", leftPath);
    rightStrapRef.current?.setAttribute("d", rightPath);
    leftStrapShadowRef.current?.setAttribute("d", leftPath);
    rightStrapShadowRef.current?.setAttribute("d", rightPath);
    leftStrapStitchRef.current?.setAttribute("d", leftPath);
    rightStrapStitchRef.current?.setAttribute("d", rightPath);

    // 4. Stopper group berputar tepat di titik pusat cincin pengait (0, 62)
    // Cincin pengait terkunci absolut di lubang kartu pada setiap sudut ayunan
    stopperGroupRef.current?.setAttribute(
      "transform",
      `translate(${junctionX}, ${junctionY}) rotate(${hookAngle}, 0, ${HOOK_OFFSET_Y})`
    );

    // 5. Transformasi kartu 3D berayun tepat dari lubang punch atas (pivot 50% 16px)
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0px) rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  };

  // Loop requestAnimationFrame
  const startAnimationLoop = () => {
    if (rafIdRef.current !== null) return;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 16.667, 2.5);
      lastTimeRef.current = now;

      const p = physics.current;
      const reducedMotion = reducedMotionRef.current;

      // Gerak sekunder tali: sx mengejar x dengan lag elastis halus
      p.sx += (p.x - p.sx) * (0.12 * dt);

      if (p.isDragging) {
        p.x += (p.targetX - p.x) * 0.38;
        p.y += (p.targetY - p.y) * 0.38;

        p.rz = (p.x / MAX_RADIUS) * 18;
        p.ry = -(p.x / MAX_RADIUS) * 14;
        p.rx = (p.y / MAX_RADIUS) * 11;

        p.vx = 0;
        p.vy = 0;
      } else {
        timeRef.current += 0.02 * dt;

        const idleX = reducedMotion ? 0 : Math.sin(timeRef.current * 1.4) * 3;
        const idleY = reducedMotion ? 0 : Math.cos(timeRef.current * 0.95) * 1.5;

        const ax = -SPRING_K * (p.x - idleX);
        const ay = -SPRING_K * (p.y - idleY);

        p.vx = (p.vx + ax * dt) * Math.pow(DAMPING, dt);
        p.vy = (p.vy + ay * dt) * Math.pow(DAMPING, dt);

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const targetRz = (p.x / 95) * 17 + (reducedMotion ? 0 : Math.sin(timeRef.current * 1.4) * 1.5);
        const targetRy = -(p.x / 95) * 12;
        const targetRx = (p.y / 95) * 9;

        p.rz += (targetRz - p.rz) * 0.14 * dt;
        p.ry += (targetRy - p.ry) * 0.14 * dt;
        p.rx += (targetRx - p.rx) * 0.14 * dt;
      }

      applyTransform(p.x, p.y, p.sx, p.rx, p.ry, p.rz);

      if (isVisibleRef.current || p.isDragging) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  };

  const stopAnimationLoop = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startAnimationLoop();
        } else if (!physics.current.isDragging) {
          stopAnimationLoop();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    startAnimationLoop();

    return () => {
      stopAnimationLoop();
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const p = physics.current;
    p.isDragging = true;
    p.dragStartX = e.clientX;
    p.dragStartY = e.clientY;
    p.initCardX = p.x;
    p.initCardY = p.y;
    p.lastPointerX = e.clientX;
    p.lastPointerY = e.clientY;
    p.lastPointerTime = performance.now();
    p.pointerVx = 0;
    p.pointerVy = 0;

    startAnimationLoop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physics.current;
    if (!p.isDragging) return;

    const now = performance.now();
    const dtMs = Math.max(now - p.lastPointerTime, 8);

    p.pointerVx = ((e.clientX - p.lastPointerX) / dtMs) * 16.667;
    p.pointerVy = ((e.clientY - p.lastPointerY) / dtMs) * 16.667;
    p.lastPointerX = e.clientX;
    p.lastPointerY = e.clientY;
    p.lastPointerTime = now;

    let deltaX = p.initCardX + (e.clientX - p.dragStartX);
    let deltaY = p.initCardY + (e.clientY - p.dragStartY);

    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (dist > MAX_RADIUS) {
      const ratio = MAX_RADIUS / dist;
      deltaX *= ratio;
      deltaY *= ratio;
    }

    p.targetX = deltaX;
    p.targetY = deltaY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    const p = physics.current;
    p.isDragging = false;

    p.vx = p.pointerVx * 0.7 - p.x * 0.1;
    p.vy = p.pointerVy * 0.7 - p.y * 0.1;
  };

  // Nilai kurva awal deterministik untuk SSR (lurus ramping alami)
  const initialLeftPath = `M ${SHOULDER_LEFT_X} ${SHOULDER_Y} Q 127 104.5 154 ${BASE_JUNCTION_Y}`;
  const initialRightPath = `M ${SHOULDER_RIGHT_X} ${SHOULDER_Y} Q 193 104.5 166 ${BASE_JUNCTION_Y}`;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center select-none w-[320px] mx-auto pt-1 pb-6"
      style={{ perspective: "1000px" }}
    >
      {/* 1. Tali Lanyard SVG Polos Hitam: 1:1 Pixel Match dengan ViewBox "0 0 320 320" */}
      <div className="absolute top-0 left-0 w-[320px] h-[320px] pointer-events-none z-10">
        <svg
          className="w-[320px] h-[320px] overflow-visible"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradien Kain Hitam Polos Premium (Matte Charcoal / Obsidian) */}
            <linearGradient id="solidBlackStrapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#222226" />
              <stop offset="30%" stopColor="#18181b" />
              <stop offset="70%" stopColor="#1c1c20" />
              <stop offset="100%" stopColor="#0f0f11" />
            </linearGradient>

            {/* Gradien Logam Krom untuk Kait Cantolan Besi */}
            <linearGradient id="chromeHookGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Filter Bayangan Halus untuk Tali */}
            <filter id="lanyardMockupShadow" x="-30%" y="-20%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* ========================================================================= */}
          {/* 1. BAGIAN ATAS LEHER (HORIZONTAL COLLAR BAND DENGAN LIPATAN MITERED 45°)  */}
          {/* ========================================================================= */}
          {/* Bayangan kerah atas */}
          <polygon
            points="90,24 104,8 216,8 230,24 214,24 204,12 116,12 106,24"
            fill="#000000"
            opacity="0.28"
            filter="url(#lanyardMockupShadow)"
          />
          {/* Kerah atas pita lanyard hitam polos */}
          <polygon
            points="90,24 104,8 216,8 230,24 214,24 204,12 116,12 106,24"
            fill="url(#solidBlackStrapGrad)"
            stroke="#09090b"
            strokeWidth="0.8"
          />

          {/* Garis lipatan mitered diagonal 45 derajat */}
          <line x1="90" y1="24" x2="106" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="230" y1="24" x2="214" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

          {/* ========================================================================= */}
          {/* 2. DUA HELAI PITA HITAM POLOS (LEBAR 22PX, KAIN SATIN MINIMALIS)         */}
          {/* ========================================================================= */}
          {/* Bayangan kedua helai tali V */}
          <path
            ref={leftStrapShadowRef}
            d={initialLeftPath}
            stroke="#000000"
            strokeWidth="24"
            strokeOpacity="0.25"
            strokeLinecap="butt"
            filter="url(#lanyardMockupShadow)"
          />
          <path
            ref={rightStrapShadowRef}
            d={initialRightPath}
            stroke="#000000"
            strokeWidth="24"
            strokeOpacity="0.25"
            strokeLinecap="butt"
            filter="url(#lanyardMockupShadow)"
          />

          {/* Pita Utama Kiri (Lebar 22px hitam polos) */}
          <path
            ref={leftStrapRef}
            d={initialLeftPath}
            stroke="url(#solidBlackStrapGrad)"
            strokeWidth="22"
            strokeLinecap="butt"
          />

          {/* Pita Utama Kanan (Lebar 22px hitam polos) */}
          <path
            ref={rightStrapRef}
            d={initialRightPath}
            stroke="url(#solidBlackStrapGrad)"
            strokeWidth="22"
            strokeLinecap="butt"
          />

          {/* Garis Kilau Halus di Sepanjang Tengah Pita (Tekstur Kain Halus) */}
          <path
            ref={leftStrapStitchRef}
            d={initialLeftPath}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="4"
            strokeLinecap="butt"
            fill="none"
          />
          <path
            ref={rightStrapStitchRef}
            d={initialRightPath}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="4"
            strokeLinecap="butt"
            fill="none"
          />

          {/* ========================================================================= */}
          {/* 3. STOPPER PLASTIK HITAM & KAIT CANTOLAN BESI KROM                        */}
          {/* ========================================================================= */}
          <g ref={stopperGroupRef} transform={`translate(${BASE_JUNCTION_X}, ${BASE_JUNCTION_Y})`}>
            {/* Pertemuan ujung kain tali yang masuk ke dalam stopper */}
            <path
              d="M -11 -6 L 11 -6 L 10 0 L -10 0 Z"
              fill="url(#solidBlackStrapGrad)"
            />

            {/* Gesper Stopper Plastik Hitam (Sleeve Quick-Release Buckle dengan lekukan samping) */}
            <path
              d="M -16 0 L 16 0 C 17 0, 18 1, 18 3 L 18 8 C 16 10, 16 12, 18 14 L 18 20 C 18 22, 17 23, 16 23 L -16 23 C -17 23, -18 22, -18 20 L -18 14 C -16 12, -16 10, -18 8 L -18 3 C -18 1, -17 0, -16 0 Z"
              fill="#18181b"
              stroke="#27272a"
              strokeWidth="1.1"
              filter="url(#lanyardMockupShadow)"
            />
            {/* Slot horizontal tengah stopper */}
            <rect
              x="-11"
              y="9.5"
              width="22"
              height="3.5"
              rx="1.2"
              fill="#f4f4f5"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {/* Garis tekstur stopper plastik */}
            <line x1="-14" y1="4.5" x2="14" y2="4.5" stroke="#3f3f46" strokeWidth="0.9" />
            <line x1="-14" y1="18.5" x2="14" y2="18.5" stroke="#3f3f46" strokeWidth="0.9" />

            {/* Pita Sambungan Pendek Bawah (Short Ribbon Tab hitam di bawah stopper) */}
            <rect
              x="-10"
              y="23"
              width="20"
              height="18"
              fill="#18181b"
              stroke="#09090b"
              strokeWidth="0.8"
            />
            {/* Garis jahitan tepi pita bawah */}
            <line x1="-8.5" y1="23" x2="-8.5" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
            <line x1="8.5" y1="23" x2="8.5" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />

            {/* Paku rivet logam di tengah pita bawah */}
            <circle cx="0" cy="32" r="2.2" fill="url(#chromeHookGrad)" stroke="#1e293b" strokeWidth="0.6" />

            {/* Cincin putar logam (Swivel Base) */}
            <ellipse
              cx="0"
              cy="43"
              rx="6.5"
              ry="3.5"
              fill="none"
              stroke="url(#chromeHookGrad)"
              strokeWidth="2.5"
            />

            {/* Badan kait cantolan besi krom (Lobster Claw Body) */}
            <path
              d="M -5.5 44 L -5.5 53 C -5.5 58 5.5 58 5.5 53 L 5.5 46"
              fill="none"
              stroke="url(#chromeHookGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Tuas pembuka cantolan pegas (Spring Trigger Lever) */}
            <circle cx="-4.5" cy="50" r="1.5" fill="url(#chromeHookGrad)" />

            {/* Cincin oval bawah kait yang menembus ke lubang punch slot kartu ID */}
            {/* Center tepat di y = 62 (absolute Y dalam container = 0 + 185 + 62 = 247px) */}
            <ellipse
              cx="0"
              cy={HOOK_OFFSET_Y}
              rx="7.5"
              ry="5"
              fill="none"
              stroke="url(#chromeHookGrad)"
              strokeWidth="2.8"
            />
          </g>
        </svg>
      </div>

      {/* 2. Kartu ID Minimal: Berputar dari titik cantolan (transformOrigin: 50% 16px) */}
      {/* Margin-top: 231px menjamin lubang punch (y = 16px dalam kartu) berada tepat di 247px, persis di cincin kait */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative z-20 w-[240px] cursor-grab active:cursor-grabbing touch-none rounded-2xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-950/10 dark:shadow-black/50"
        style={{
          marginTop: "231px",
          transformOrigin: "50% 16px",
          transform: "translate3d(0px, 0px, 0px)",
          willChange: "transform",
        }}
      >
        {/* Lubang Klip Kartu (Punch slot tempat cincin kait logam masuk) */}
        <div className="w-8 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 mx-auto mb-2 shadow-inner" />

        {/* Foto: Rasio 4:5, rounded, object-cover object-top */}
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={avatar}
            alt={fullName}
            fill
            sizes="240px"
            priority
            className="object-cover object-top rounded-xl pointer-events-none"
          />
        </div>

        {/* Teks Identitas: Sentence case, hanya 4 hal (Foto, Nama, Jabatan, Lokasi) */}
        <div className="mt-2.5 px-1 text-left">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-snug tracking-tight">
            {fullName}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
            {title}
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {location}
          </p>
        </div>
      </div>

      {/* 3. Petunjuk Kecil di Bawah Kartu: Hilang setelah kartu disentuh pertama kali */}
      <div className="h-6 flex items-center justify-center mt-2.5 pointer-events-none">
        {!hasInteracted && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tight transition-opacity duration-300">
            {lang === "id" ? "Tarik kartunya" : "Drag the card"}
          </p>
        )}
      </div>
    </div>
  );
};
