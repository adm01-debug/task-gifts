import { motion } from "framer-motion";

export const FloatingShapes = () => {
  const shapes = [
    { size: 80, x: "15%", y: "20%", delay: 0, color: "primary" },
    { size: 60, x: "80%", y: "30%", delay: 1, color: "secondary" },
    { size: 100, x: "70%", y: "70%", delay: 2, color: "accent" },
    { size: 40, x: "25%", y: "75%", delay: 0.5, color: "primary" },
    { size: 50, x: "90%", y: "85%", delay: 1.5, color: "secondary" },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-2xl border opacity-20`}
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            borderColor: `hsl(var(--${shape.color}))`,
            background: `linear-gradient(135deg, hsl(var(--${shape.color}) / 0.1), transparent)`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};
