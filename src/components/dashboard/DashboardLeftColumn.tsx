import { memo } from "react";
import { SocialFeed } from "@/components/SocialFeed";
import DepartmentMissions from "@/components/DepartmentMissions";
import { DailyQuests } from "@/components/DailyQuests";
import { PeerRecognition } from "@/components/PeerRecognition";
import { TeamChallenges } from "@/components/TeamChallenges";
import { GoalsWidget } from "@/components/GoalsWidget";
import { MoodTrackerWidget } from "@/components/MoodTrackerWidget";
import { CelebrationsBanner } from "@/components/CelebrationsBanner";
import { PulseSurveyWidget } from "@/components/PulseSurveyWidget";
import { AnnouncementsBoard } from "@/components/AnnouncementsBoard";
import { AutoChallengesWidget } from "@/components/AutoChallengesWidget";
import { StaggeredContainer, StaggeredItemLeft } from "@/components/StaggeredContainer";
import { LazyWidget } from "./LazyWidget";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

/**
 * DashboardLeftColumn - Contains primary content widgets
 * Missions, Quests, Team & Recognition + Goals, Mood, Celebrations, Surveys, Announcements
 * Each widget is wrapped with SectionErrorBoundary for fault isolation
 */
export const DashboardLeftColumn = memo(function DashboardLeftColumn() {
  return (
    <StaggeredContainer 
      className="lg:col-span-2 space-y-4 md:space-y-6"
      staggerDelay={0.12}
      initialDelay={0.1}
    >
      {/* Celebrations Banner - Priority */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Celebrações">
          <CelebrationsBanner />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Auto Challenges Widget - Gamified weekly challenges */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Desafios Semanais">
          <AutoChallengesWidget />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Announcements Board - Important for communication */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Anúncios">
          <AnnouncementsBoard />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Social Feed - Above the fold, render immediately */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Feed Social">
          <SocialFeed limit={20} />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Goals Widget - OKRs overview */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Metas & OKRs">
          <GoalsWidget />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Department Missions - Usually visible */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Missões do Departamento">
          <DepartmentMissions />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Daily Quests - Core feature, render immediately */}
      <StaggeredItemLeft>
        <SectionErrorBoundary sectionName="Quests Diárias">
          <DailyQuests />
        </SectionErrorBoundary>
      </StaggeredItemLeft>

      {/* Pulse Survey Widget */}
      <StaggeredItemLeft>
        <LazyWidget fallbackHeight="200px">
          <SectionErrorBoundary sectionName="Pulse Survey">
            <PulseSurveyWidget />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemLeft>

      {/* Peer Recognition - Below the fold on most devices */}
      <StaggeredItemLeft>
        <LazyWidget fallbackHeight="280px">
          <SectionErrorBoundary sectionName="Reconhecimento">
            <PeerRecognition />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemLeft>

      {/* Team Challenges - Below the fold */}
      <StaggeredItemLeft>
        <LazyWidget fallbackHeight="240px">
          <SectionErrorBoundary sectionName="Desafios em Equipe">
            <TeamChallenges />
          </SectionErrorBoundary>
        </LazyWidget>
      </StaggeredItemLeft>
    </StaggeredContainer>
  );
});
