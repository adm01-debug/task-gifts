import { memo } from "react";
import { WeeklyChallengeCard } from "@/components/WeeklyChallengeCard";
import { ComboIndicator } from "@/components/ComboIndicator";
import { ComboHistory } from "@/components/ComboHistory";
import { WeeklyPerformanceComparison } from "@/components/WeeklyPerformanceComparison";
import { AttendanceModule } from "@/components/AttendanceModule";
import DepartmentRankings from "@/components/DepartmentRankings";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { KudosRanking } from "@/components/KudosRanking";
import { AnalyticsWidget } from "@/components/AnalyticsWidget";
import { RewardsShop } from "@/components/RewardsShop";
import { StaggeredContainer, StaggeredItemRight } from "@/components/StaggeredContainer";
import { LazyWidget } from "./LazyWidget";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

/**
 * DashboardRightColumn - Contains secondary content widgets
 * Combo, Attendance, Rankings, Leaderboard, Kudos, Analytics & Rewards
 * Uses LazyWidget for below-the-fold content to improve performance
 * Each widget is wrapped with SectionErrorBoundary for fault isolation
 */
export const DashboardRightColumn = memo(function DashboardRightColumn() {
  return (
    <StaggeredContainer 
      className="space-y-4 md:space-y-6"
      staggerDelay={0.1}
      initialDelay={0.2}
    >
      {/* Weekly Challenge - Above the fold priority */}
      <StaggeredItemRight>
        <SectionErrorBoundary sectionName="Desafio Semanal">
          <WeeklyChallengeCard />
        </SectionErrorBoundary>
      </StaggeredItemRight>

      {/* Combo Indicator - Core gamification, render immediately */}
      <StaggeredItemRight>
        <SectionErrorBoundary sectionName="Combo">
          <ComboIndicator variant="full" />
        </SectionErrorBoundary>
      </StaggeredItemRight>

      {/* Combo History - Can be lazy */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="160px">
          <SectionErrorBoundary sectionName="Histórico de Combo">
            <ComboHistory />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>

      {/* Weekly Performance - Can be lazy */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="200px">
          <SectionErrorBoundary sectionName="Comparativo Semanal">
            <WeeklyPerformanceComparison />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>

      {/* Attendance Module - Important, render immediately */}
      <StaggeredItemRight>
        <SectionErrorBoundary sectionName="Ponto">
          <AttendanceModule />
        </SectionErrorBoundary>
      </StaggeredItemRight>

      {/* Department Rankings - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="320px">
          <SectionErrorBoundary sectionName="Rankings por Departamento">
            <DepartmentRankings />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>

      {/* Live Leaderboard - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="400px">
          <SectionErrorBoundary sectionName="Leaderboard">
            <LiveLeaderboard />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>

      {/* Kudos Ranking - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="280px">
          <SectionErrorBoundary sectionName="Ranking de Kudos">
            <KudosRanking />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>

      {/* Analytics Widget - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="320px">
          <SectionErrorBoundary sectionName="Analytics">
            <AnalyticsWidget />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>

      {/* Rewards Shop - Bottom of page */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="360px">
          <SectionErrorBoundary sectionName="Loja de Recompensas">
            <RewardsShop />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemRight>
    </StaggeredContainer>
  );
});
