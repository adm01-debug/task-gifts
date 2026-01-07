import { useState, useEffect, ReactNode, forwardRef } from "react";
import { motion } from "framer-motion";
import { ShieldX, RefreshCw, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface IpAccessGuardProps {
  children: ReactNode;
}

interface IpVerificationResult {
  allowed: boolean;
  ip: string;
  reason: string;
  message: string;
}

export const IpAccessGuard = forwardRef<HTMLDivElement, IpAccessGuardProps>(
  function IpAccessGuard({ children }, _ref) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    const [ipInfo, setIpInfo] = useState<IpVerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkIpAccess = async () => {
      setIsChecking(true);
      setError(null);
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke('verify-ip');
        
        if (fnError) {
          console.error('Error verifying IP:', fnError);
          // On error, allow access (fail open)
          setIsAllowed(true);
          setError('Não foi possível verificar o IP. Acesso permitido temporariamente.');
          return;
        }

        const result = data as IpVerificationResult;
        setIpInfo(result);
        setIsAllowed(result.allowed);
        
      } catch (err) {
        console.error('IP check failed:', err);
        // On error, allow access (fail open)
        setIsAllowed(true);
        setError('Erro de conexão. Acesso permitido temporariamente.');
      } finally {
        setIsChecking(false);
      }
    };

    useEffect(() => {
      checkIpAccess();
    }, []);

    // Loading state
    if (isChecking) {
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

    // Access denied
    if (isAllowed === false) {
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
                  Seu endereço IP não está autorizado
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
                    <span className="text-destructive font-medium">Não autorizado</span>
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

    // Access allowed - render children
    return <>{children}</>;
  }
);
