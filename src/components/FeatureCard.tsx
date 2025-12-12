import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: "primary" | "secondary" | "accent";
  delay?: number;
}

export const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) => {
  const gradientStyles = {
    primary: "from-primary/20 to-transparent border-primary/20 hover:border-primary/40",
    secondary: "from-secondary/20 to-transparent border-secondary/20 hover:border-secondary/40",
    accent: "from-accent/20 to-transparent border-accent/20 hover:border-accent/40",
  };

  const glowStyles = {
    primary: "group-hover:shadow-[0_0_40px_hsl(190_100%_50%/0.2)]",
    secondary: "group-hover:shadow-[0_0_40px_hsl(270_100%_65%/0.2)]",
    accent: "group-hover:shadow-[0_0_40px_hsl(340_90%_60%/0.2)]",
  };

  const iconColors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <div
        className={`
          relative h-full p-8 rounded-2xl border backdrop-blur-xl
          bg-gradient-to-b ${gradientStyles[gradient]}
          transition-all duration-500 ${glowStyles[gradient]}
        `}
      >
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
        
        <div className="relative z-10">
          <motion.div
            className={`
              inline-flex p-4 rounded-xl mb-6
              bg-gradient-to-br ${gradientStyles[gradient]}
              ${iconColors[gradient]}
            `}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-3 text-foreground group-hover:gradient-text transition-all duration-300">
            {title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
