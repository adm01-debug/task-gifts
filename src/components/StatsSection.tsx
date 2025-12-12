import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface CounterProps {
  target: number;
  suffix?: string;
  duration?: number;
}

const Counter = ({ target, suffix = "", duration = 2 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    const increment = end / (duration * 60);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const StatsSection = () => {
  const stats = [
    { value: 100, suffix: "%", label: "Interativo", color: "primary" },
    { value: 60, suffix: "fps", label: "Animações", color: "secondary" },
    { value: 0, suffix: "ms", label: "Delay", color: "accent" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
          whileHover={{ scale: 1.05 }}
          className="text-center group"
        >
          <div 
            className={`
              text-5xl md:text-6xl font-bold mb-2
              ${stat.color === "primary" ? "text-primary" : ""}
              ${stat.color === "secondary" ? "text-secondary" : ""}
              ${stat.color === "accent" ? "text-accent" : ""}
            `}
          >
            <Counter target={stat.value} suffix={stat.suffix} />
          </div>
          <div className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
