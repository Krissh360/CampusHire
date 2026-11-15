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
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 696 316"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {paths.map((p) => (
        <motion.path
          key={p.id}
          d={p.d}
          stroke="currentColor"
          strokeWidth={p.width}
          strokeOpacity={0.1 + p.id * 0.03}
          initial={{ pathLength: 0.3, opacity: 0.6 }}
          animate={
            reduceMotion
              ? { pathLength: 1, opacity: 0.5 }
              : {
                  pathLength: 1,
                  opacity: [0.3, 0.6, 0.3],
                  pathOffset: [0, 1, 0],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        />
      ))}
    </svg>
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