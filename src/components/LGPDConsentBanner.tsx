import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "lgpd_consent_accepted";
const DPO_EMAIL = "dpo@gamificarh.com.br";

export function LGPDConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = sessionStorage.getItem(CONSENT_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    sessionStorage.setItem(CONSENT_KEY, new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Este sistema coleta dados pessoais para fins de gamificação e gestão de desempenho,
          conforme a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.
          Ao continuar, você consente com o tratamento dos seus dados.
          Para exercer seus direitos (acesso, correção, exclusão), entre em contato com
          nosso DPO: <a href={`mailto:${DPO_EMAIL}`} className="underline font-medium">{DPO_EMAIL}</a>.
        </p>
        <Button onClick={accept} size="sm">
          Aceitar e continuar
        </Button>
      </div>
    </div>
  );
}
