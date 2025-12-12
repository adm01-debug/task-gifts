import { motion } from "framer-motion";
import { useState } from "react";

export const InteractiveDemo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const items = [
    { label: "Design", color: "primary" },
    { label: "Animate", color: "secondary" },
    { label: "Ship", color: "accent" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="glass rounded-3xl p-8 md:p-12">
        {/* Interactive tabs */}
        <div className="flex gap-2 mb-8">
          {items.map((item, i) => (
            <motion.button
              key={item.label}
              onClick={() => setActiveIndex(i)}
              className={`
                relative px-6 py-3 rounded-xl font-semibold text-sm
                transition-colors duration-300
                ${activeIndex === i ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeIndex === i && (
                <motion.div
                  layoutId="activeTab"
                  className={`
                    absolute inset-0 rounded-xl
                    ${item.color === "primary" ? "bg-primary glow-primary" : ""}
                    ${item.color === "secondary" ? "bg-secondary glow-secondary" : ""}
                    ${item.color === "accent" ? "bg-accent glow-accent" : ""}
                  `}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo content */}
        <div className="relative h-64 rounded-2xl bg-muted/30 overflow-hidden">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {activeIndex === 0 && (
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  />
                ))}
              </div>
            )}
            
            {activeIndex === 1 && (
              <div className="relative w-32 h-32">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-secondary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-secondary to-secondary/50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            )}
            
            {activeIndex === 2 && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <motion.div
                  className="w-16 h-2 rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.span
                  className="text-accent font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Shipped! 🚀
                </motion.span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
