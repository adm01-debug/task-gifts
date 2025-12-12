import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Check } from "lucide-react";

export const MorphingButton = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 2000);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-lg
        transition-colors duration-300
        ${isClicked 
          ? "bg-green-500 text-primary-foreground" 
          : "bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground"
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <motion.span
        className="flex items-center gap-2"
        initial={false}
        animate={{ opacity: 1 }}
        key={isClicked ? "clicked" : "default"}
      >
        {isClicked ? (
          <>
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Check className="w-5 h-5" />
            </motion.span>
            Perfeito!
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Clique aqui
          </>
        )}
      </motion.span>
      
      {/* Ripple effect */}
      {isClicked && (
        <motion.div
          className="absolute inset-0 bg-foreground/10"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ borderRadius: "inherit" }}
        />
      )}
    </motion.button>
  );
};
