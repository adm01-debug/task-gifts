import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Gift, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Bem-vindo de volta! 🎮");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, displayName || undefined);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada! Vamos jogar! 🚀");
          navigate("/");
        }
      }
    } catch (err) {
      toast.error("Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, hsl(24 95% 55%) 0%, transparent 70%)",
            top: "10%",
            left: "20%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
          style={{
            background: "radial-gradient(circle, hsl(210 100% 60%) 0%, transparent 70%)",
            bottom: "20%",
            right: "10%",
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
                <Gift className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Task Gifts</h1>
                <p className="text-sm text-muted-foreground">Gamify your work</p>
              </div>
            </div>

            <h2 className="text-display-lg mb-4">
              Transforme trabalho em{" "}
              <span className="gradient-text">diversão</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Complete quests diárias, suba de nível, desbloqueie recompensas e 
              compita com sua equipe. Produtividade nunca foi tão divertida.
            </p>

            <div className="space-y-4">
              {[
                { icon: "🎯", text: "Quests diárias personalizadas" },
                { icon: "🏆", text: "Leaderboards em tempo real" },
                { icon: "🎁", text: "Recompensas exclusivas" },
                { icon: "👥", text: "Desafios em equipe" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-muted-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 border border-border">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Task Gifts</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-8">
              {["Login", "Cadastro"].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setIsLogin(i === 0)}
                  className={`
                    flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                    ${(i === 0 ? isLogin : !isLogin) 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground"}
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {!isLogin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Nome de exibição
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Seu nome no game"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="seu@email.com"
                      className={`
                        w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border outline-none transition-all
                        ${errors.email 
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}
                      `}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: undefined });
                      }}
                      placeholder="••••••••"
                      className={`
                        w-full pl-12 pr-12 py-3 rounded-xl bg-muted/50 border outline-none transition-all
                        ${errors.password 
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base"
                  variant="hero"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Entrar" : "Criar conta"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Demo access */}
            <button
              onClick={() => {
                setEmail("demo@taskgifts.com");
                setPassword("demo123");
                toast.info("Credenciais de demo preenchidas!");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="w-4 h-4" />
              Usar conta demo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
