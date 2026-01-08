import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLoginLockout } from "@/hooks/useLoginLockout";
import { Gift, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Clock, CheckCircle, ShieldX, Globe, AlertTriangle, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { passwordResetService } from "@/services/passwordResetService";
import { twoFactorService } from "@/services/twoFactorService";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  emailSchema, 
  passwordSchema, 
  loginSchema, 
  signupSchema 
} from "@/lib/authValidations";

type AuthView = "login" | "signup" | "forgot-password" | "2fa-verify";

interface IpVerificationResult {
  allowed: boolean;
  ip: string;
  reason: string;
  message: string;
}

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [verifying2FA, setVerifying2FA] = useState(false);
  
  // IP Validation states
  const [isCheckingIp, setIsCheckingIp] = useState(true);
  const [isIpAllowed, setIsIpAllowed] = useState<boolean | null>(null);
  const [ipInfo, setIpInfo] = useState<IpVerificationResult | null>(null);

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Login lockout hook
  const { 
    isLocked, 
    failedAttempts, 
    remainingTime,
    checkLockout, 
    logFailedAttempt, 
    resetAttempts,
    formatRemainingTime 
  } = useLoginLockout(email);

  // Check IP access on mount
  const checkIpAccess = async () => {
    setIsCheckingIp(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-ip');
      
      if (fnError) {
        console.error('Error verifying IP:', fnError);
        // On error, allow access (fail open)
        setIsIpAllowed(true);
        return;
      }

      const result = data as IpVerificationResult;
      setIpInfo(result);
      setIsIpAllowed(result.allowed);
      
      if (!result.allowed) {
        toast.error('Acesso bloqueado: IP não autorizado');
      }
    } catch (err) {
      console.error('IP check failed:', err);
      // On error, allow access (fail open)
      setIsIpAllowed(true);
    } finally {
      setIsCheckingIp(false);
    }
  };

  useEffect(() => {
    checkIpAccess();
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking IP
  if (isCheckingIp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <motion.div
              className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Verificando acesso...</h2>
          <p className="text-sm text-muted-foreground">Validando seu endereço IP</p>
        </motion.div>
      </div>
    );
  }

  // IP Blocked - show access denied
  if (isIpAllowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-destructive/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldX className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Acesso Negado</CardTitle>
              <CardDescription>
                Seu endereço IP não está autorizado para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seu IP:</span>
                  <span className="font-mono font-medium">{ipInfo?.ip || 'Desconhecido'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-destructive font-medium">Bloqueado</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {ipInfo?.message || 'Entre em contato com o administrador para solicitar acesso.'}
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={checkIpAccess}
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show loading while checking auth or if user is authenticated (will redirect)
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};
    
    if (view === "forgot-password") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    } else if (view === "login") {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        result.error.errors.forEach((err) => {
          if (err.path[0] === "email") newErrors.email = err.message;
          if (err.path[0] === "password") newErrors.password = err.message;
        });
      }
    } else {
      const result = signupSchema.safeParse({ email, password, displayName: displayName || undefined });
      if (!result.success) {
        result.error.errors.forEach((err) => {
          if (err.path[0] === "email") newErrors.email = err.message;
          if (err.path[0] === "password") newErrors.password = err.message;
          if (err.path[0] === "displayName") newErrors.displayName = err.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setLoading(true);
    try {
      // Primeiro, verificar se o usuário existe e obter o ID
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (userError || !userData) {
        toast.error("Email não encontrado no sistema");
        setLoading(false);
        return;
      }

      // Solicitar reset com aprovação do gestor
      await passwordResetService.requestPasswordReset();
      
      toast.success(
        "Solicitação enviada! Aguarde a aprovação do seu gestor para redefinir a senha.",
        { duration: 6000 }
      );
      setView("login");
    } catch (err: any) {
      if (err.message?.includes("pendente")) {
        toast.info("Você já possui uma solicitação pendente. Aguarde a aprovação do seu gestor.");
      } else {
        toast.error("Erro ao solicitar reset de senha. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (view === "forgot-password") {
      await handleForgotPassword();
      return;
    }

    if (!validateForm()) return;

    // Check lockout before attempting login
    if (view === "login") {
      const lockoutStatus = await checkLockout();
      if (lockoutStatus?.is_locked) {
        const minutes = Math.ceil(lockoutStatus.remaining_seconds / 60);
        toast.error(`Conta temporariamente bloqueada. Tente novamente em ${minutes} minuto(s).`);
        return;
      }
    }

    setLoading(true);

    try {
      if (view === "login") {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Log failed attempt
          const lockoutResult = await logFailedAttempt(error.message);
          
          if (error.message.includes("Invalid login credentials")) {
            if (lockoutResult?.is_locked) {
              const minutes = Math.ceil(lockoutResult.remaining_seconds / 60);
              toast.error(`Conta bloqueada por ${minutes} minuto(s) após ${lockoutResult.failed_attempts} tentativas.`);
            } else if (lockoutResult && lockoutResult.failed_attempts >= 3) {
              toast.error(`Email ou senha incorretos. ${5 - lockoutResult.failed_attempts} tentativa(s) restante(s).`);
            } else {
              toast.error("Email ou senha incorretos");
            }
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          // Reset failed attempts on successful login
          await resetAttempts();
          
          // Check if 2FA is enabled
          const is2FAEnabled = await twoFactorService.isTwoFactorEnabled(data.user.id);
          
          if (is2FAEnabled) {
            // Sign out and require 2FA
            await supabase.auth.signOut();
            setPendingUserId(data.user.id);
            setView("2fa-verify");
          } else {
            toast.success("Bem-vindo de volta! 🎮");
            navigate("/");
          }
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

  const handle2FAVerify = async (code: string): Promise<boolean> => {
    if (!pendingUserId) return false;
    
    setVerifying2FA(true);
    try {
      const isValid = await twoFactorService.verifyToken(pendingUserId, code);
      
      if (isValid) {
        // Now sign in properly
        const { error } = await signIn(email, password);
        if (error) {
          toast.error("Erro ao finalizar login");
          return false;
        }
        toast.success("Bem-vindo de volta! 🎮");
        navigate("/");
        return true;
      }
      return false;
    } catch (error) {
      console.error("2FA verification error:", error);
      return false;
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleCancel2FA = () => {
    setPendingUserId(null);
    setView("login");
    setPassword("");
  };

  const renderFormContent = () => {
    if (view === "2fa-verify") {
      return (
        <motion.div
          key="2fa-verify"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <TwoFactorVerify
            onVerify={handle2FAVerify}
            onCancel={handleCancel2FA}
            isLoading={verifying2FA}
          />
        </motion.div>
      );
    }

    if (view === "forgot-password") {
      return (
        <motion.div
          key="forgot-password"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <button
            type="button"
            onClick={() => setView("login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Redefinir senha</h3>
            <p className="text-sm text-muted-foreground">
              Por segurança, a redefinição de senha requer aprovação do seu gestor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <p className="text-xs text-destructive mt-1" role="alert">{errors.email}</p>
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
                  Solicitar redefinição
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      );
    }

    return (
      <motion.form
        key={view}
        initial={{ opacity: 0, x: view === "login" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: view === "login" ? 20 : -20 }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {view === "signup" && (
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
            <p className="text-xs text-destructive mt-1" role="alert">{errors.email}</p>
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
            <p className="text-xs text-destructive mt-1" role="alert">{errors.password}</p>
          )}
          {view === "signup" && (
            <PasswordStrengthIndicator password={password} className="mt-3" />
          )}
        </div>

        {view === "login" && (
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        )}

        {/* Lockout warning */}
        {view === "login" && isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <Timer className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Conta bloqueada após {failedAttempts} tentativas.
                </span>
                <span className="font-mono font-bold text-lg">
                  {formatRemainingTime()}
                </span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Warning for approaching lockout */}
        {view === "login" && !isLocked && failedAttempts >= 3 && failedAttempts < 5 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                Atenção: {5 - failedAttempts} tentativa(s) restante(s) antes do bloqueio temporário.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={loading || (view === "login" && isLocked)}
          className="w-full h-12 text-base"
          variant="hero"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isLocked && view === "login" ? (
            <>
              <Timer className="w-5 h-5 mr-2" />
              Aguarde {formatRemainingTime()}
            </>
          ) : (
            <>
              {view === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </motion.form>
    );
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

            {/* Tabs - only show when not in forgot-password view */}
            {view !== "forgot-password" && (
              <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-8">
                {["Login", "Cadastro"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setView(i === 0 ? "login" : "signup")}
                    className={`
                      flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                      ${(i === 0 ? view === "login" : view === "signup") 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {renderFormContent()}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
