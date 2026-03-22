import { ClipboardList } from "lucide-react";
import { PulseSurveyWidget } from "@/components/PulseSurveyWidget";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { DesktopBackButton, GlobalBreadcrumbs } from "@/components/navigation";

export default function Surveys() {
  const seoData = useSEO();

  return (
    <PageWrapper pageName="Pesquisas" className="min-h-screen bg-background">
      <SEOHead {...seoData} />
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <DesktopBackButton />
        <ClipboardList className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Pulse Surveys</h1>
      </header>
      <GlobalBreadcrumbs className="px-4 md:px-6 pt-3" />

      <main className="p-4 md:p-6 max-w-4xl mx-auto">
        <PulseSurveyWidget />
      </main>
    </PageWrapper>
  );
}
