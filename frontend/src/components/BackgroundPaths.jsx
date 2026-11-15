import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

function FloatingPaths({ position, count }) {
  const reduceMotion = useReducedMotion();

  // useMemo so durations don't re-randomize on every re-render
  const paths = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
        duration: 20 + Math.random() * 10,
      })),
    [position, count]
  );

  return (
    <motion.svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 696 316"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      initial={{ x: 0, opacity: 0.55 }}
      animate={reduceMotion ? { x: 0, opacity: 0.55 } : { x: [0, 12, 0], opacity: [0.35, 0.6, 0.35] }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: paths[0]?.duration || 24, repeat: Infinity, ease: "linear" }
      }
      style={{ willChange: "transform, opacity" }}
    >
      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke="currentColor"
          strokeWidth={p.width}
          strokeOpacity={0.1 + p.id * 0.03}
        />
      ))}
    </motion.svg>
  );
}

export default function BackgroundPaths({
  opacity = 0.3,            // overall strength, 0 to 1
  colorClass = "text-primary", // any Tailwind text color token
  count = 36,               // fewer paths = lighter on performance
  className = "",
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${colorClass} ${className}`}
      style={{ opacity }}
    >
      <FloatingPaths position={1} count={count} />
      <FloatingPaths position={-1} count={count} />
    </div>
  );
}