import { Megaphone } from "lucide-react";
import { AnnouncementsBoard } from "@/components/AnnouncementsBoard";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePageLayout } from "@/components/mobile";
import { DesktopBackButton, GlobalBreadcrumbs } from "@/components/navigation";

export default function Announcements() {
  const seoData = useSEO();
  const isMobile = useIsMobile();

  const pageContent = (
    <>
      <SEOHead {...seoData} />
      <main className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
        <AnnouncementsBoard />
      </main>
    </>
  );

  // Mobile: use MobilePageLayout
  if (isMobile) {
    return (
      <MobilePageLayout
        title="Mural de Anúncios"
        icon={Megaphone}
        backPath="/"
      >
        {pageContent}
      </MobilePageLayout>
    );
  }

  // Desktop: original layout
  return (
    <PageWrapper pageName="Anúncios" className="min-h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <DesktopBackButton />
        <Megaphone className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Mural de Anúncios</h1>
      </header>
      <GlobalBreadcrumbs className="px-4 md:px-6 pt-3" />
      {pageContent}
    </PageWrapper>
  );
}