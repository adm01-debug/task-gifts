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

/**
 * DashboardRightColumn - Contains secondary content widgets
 * Combo, Attendance, Rankings, Leaderboard, Kudos, Analytics & Rewards
 * Uses LazyWidget for below-the-fold content to improve performance
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
        <WeeklyChallengeCard />
      </StaggeredItemRight>

      {/* Combo Indicator - Core gamification, render immediately */}
      <StaggeredItemRight>
        <ComboIndicator variant="full" />
      </StaggeredItemRight>

      {/* Combo History - Can be lazy */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="160px">
          <ComboHistory />
        </LazyWidget>
      </StaggeredItemRight>

      {/* Weekly Performance - Can be lazy */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="200px">
          <WeeklyPerformanceComparison />
        </LazyWidget>
      </StaggeredItemRight>

      {/* Attendance Module - Important, render immediately */}
      <StaggeredItemRight>
        <AttendanceModule />
      </StaggeredItemRight>

      {/* Department Rankings - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="320px">
          <DepartmentRankings />
        </LazyWidget>
      </StaggeredItemRight>

      {/* Live Leaderboard - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="400px">
          <LiveLeaderboard />
        </LazyWidget>
      </StaggeredItemRight>

      {/* Kudos Ranking - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="280px">
          <KudosRanking />
        </LazyWidget>
      </StaggeredItemRight>

      {/* Analytics Widget - Below the fold */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="320px">
          <AnalyticsWidget />
        </LazyWidget>
      </StaggeredItemRight>

      {/* Rewards Shop - Bottom of page */}
      <StaggeredItemRight>
        <LazyWidget fallbackHeight="360px">
          <RewardsShop />
        </LazyWidget>
      </StaggeredItemRight>
    </StaggeredContainer>
  );
});
