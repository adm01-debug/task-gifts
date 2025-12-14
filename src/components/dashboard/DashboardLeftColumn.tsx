import { memo } from "react";
import { SocialFeed } from "@/components/SocialFeed";
import DepartmentMissions from "@/components/DepartmentMissions";
import { DailyQuests } from "@/components/DailyQuests";
import { PeerRecognition } from "@/components/PeerRecognition";
import { TeamChallenges } from "@/components/TeamChallenges";
import { StaggeredContainer, StaggeredItemLeft } from "@/components/StaggeredContainer";
import { LazyWidget } from "./LazyWidget";

/**
 * DashboardLeftColumn - Contains primary content widgets
 * Missions, Quests, Team & Recognition
 */
export const DashboardLeftColumn = memo(function DashboardLeftColumn() {
  return (
    <StaggeredContainer 
      className="lg:col-span-2 space-y-4 md:space-y-6"
      staggerDelay={0.12}
      initialDelay={0.1}
    >
      {/* Social Feed - Above the fold, render immediately */}
      <StaggeredItemLeft>
        <SocialFeed limit={20} />
      </StaggeredItemLeft>

      {/* Department Missions - Usually visible */}
      <StaggeredItemLeft>
        <DepartmentMissions />
      </StaggeredItemLeft>

      {/* Daily Quests - Core feature, render immediately */}
      <StaggeredItemLeft>
        <DailyQuests />
      </StaggeredItemLeft>

      {/* Peer Recognition - Below the fold on most devices */}
      <StaggeredItemLeft>
        <LazyWidget fallbackHeight="280px">
          <PeerRecognition />
        </LazyWidget>
      </StaggeredItemLeft>

      {/* Team Challenges - Below the fold */}
      <StaggeredItemLeft>
        <LazyWidget fallbackHeight="240px">
          <TeamChallenges />
        </LazyWidget>
      </StaggeredItemLeft>
    </StaggeredContainer>
  );
});
