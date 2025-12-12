import { motion } from "framer-motion";
import { Zap, Layers, Wand2, MousePointer2, Palette, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FloatingShapes } from "@/components/FloatingShapes";
import { FeatureCard } from "@/components/FeatureCard";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { StatsSection } from "@/components/StatsSection";
import { MorphingButton } from "@/components/MorphingButton";

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <FloatingShapes />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="container max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                Design que vive e respira
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance leading-[1.1]">
              <span className="text-foreground">Melhor que</span>
              <br />
              <span className="gradient-text">o Figma</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Porque design de verdade não é estático. 
              É movimento, interação e emoção.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl">
                <Zap className="w-5 h-5" />
                Experimente agora
              </Button>
              <Button variant="glass" size="xl">
                Ver exemplos
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ height: [6, 12, 6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 rounded-full bg-primary"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              O que <span className="gradient-text">código pode fazer</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Que nenhum arquivo .fig consegue replicar
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MousePointer2}
              title="Interações Reais"
              description="Hover, click, drag, scroll — estados que você sente, não apenas imagina."
              gradient="primary"
              delay={0}
            />
            <FeatureCard
              icon={Layers}
              title="Animações Fluidas"
              description="60fps de pura satisfação. Transições que guiam o olhar naturalmente."
              gradient="secondary"
              delay={0.1}
            />
            <FeatureCard
              icon={Wand2}
              title="Efeitos Dinâmicos"
              description="Glassmorphism, gradientes animados, glows que respondem ao contexto."
              gradient="accent"
              delay={0.2}
            />
            <FeatureCard
              icon={Palette}
              title="Design System Vivo"
              description="Temas que mudam, cores que se adaptam, consistência que evolui."
              gradient="secondary"
              delay={0.3}
            />
            <FeatureCard
              icon={Code2}
              title="Prototipagem Real"
              description="Não é simulação — é o produto final, funcionando de verdade."
              gradient="primary"
              delay={0.4}
            />
            <FeatureCard
              icon={Zap}
              title="Performance Native"
              description="Otimizado para qualquer dispositivo. Sem lag, sem espera."
              gradient="accent"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6">
        <div className="container max-w-4xl mx-auto">
          <StatsSection />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative py-32 px-6">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Experimente <span className="gradient-text">agora</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Interaja com os elementos — isso não existe no Figma
            </p>
          </motion.div>

          <InteractiveDemo />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <MorphingButton />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Pronto para ir além do{" "}
              <span className="gradient-text">estático?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Design não é só aparência. É como algo funciona, como responde, como faz você sentir.
            </p>
            <Button variant="hero" size="xl">
              Comece a criar
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-border">
        <div className="container max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Feito com código, amor e{" "}
            <span className="gradient-text font-semibold">movimento</span>
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
