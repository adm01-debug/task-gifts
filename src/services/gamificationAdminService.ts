import { supabase } from "@/integrations/supabase/client";

// Types
export interface GamificationTheme {
  id: string;
  department_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  color_primary: string;
  color_secondary: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CustomRank {
  id: string;
  theme_id: string;
  name: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  min_level: number;
  max_level: number | null;
  xp_multiplier: number;
  coin_multiplier: number;
  order_index: number;
  badge_url: string | null;
  special_perks: string[];
  created_at: string;
  updated_at: string;
}

export interface CustomBadge {
  id: string;
  theme_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: string;
  unlock_condition: Json | null;
  xp_reward: number;
  coin_reward: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface CustomTitle {
  id: string;
  theme_id: string;
  name: string;
  prefix: string | null;
  suffix: string | null;
  description: string | null;
  icon: string;
  color: string;
  unlock_type: 'level' | 'achievement' | 'purchase' | 'manual' | 'event';
  unlock_requirement: Json | null;
  is_limited: boolean;
  max_holders: number | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface LevelConfig {
  id: string;
  theme_id: string;
  level: number;
  name: string | null;
  xp_required: number;
  icon: string;
  color: string;
  rank_id: string | null;
  rewards: { coins: number; special_item: string | null };
  created_at: string;
}

// Themes CRUD
export async function getThemes(): Promise<GamificationTheme[]> {
  const { data, error } = await supabase
    .from('gamification_themes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as GamificationTheme[];
}

export async function getThemeByDepartment(departmentId: string): Promise<GamificationTheme | null> {
  const { data, error } = await supabase
    .from('gamification_themes')
    .select('*')
    .eq('department_id', departmentId)
    .maybeSingle();

  if (error) throw error;
  return data as GamificationTheme | null;
}

export async function createTheme(theme: Omit<GamificationTheme, 'id' | 'created_at' | 'updated_at'>): Promise<GamificationTheme> {
  const { data, error } = await supabase
    .from('gamification_themes')
    .insert(theme)
    .select()
    .single();

  if (error) throw error;
  return data as GamificationTheme;
}

export async function updateTheme(id: string, updates: Partial<GamificationTheme>): Promise<GamificationTheme> {
  const { data, error } = await supabase
    .from('gamification_themes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GamificationTheme;
}

export async function deleteTheme(id: string): Promise<void> {
  const { error } = await supabase
    .from('gamification_themes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Ranks CRUD
export async function getRanksByTheme(themeId: string): Promise<CustomRank[]> {
  const { data, error } = await supabase
    .from('custom_ranks')
    .select('*')
    .eq('theme_id', themeId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as CustomRank[];
}

export async function createRank(rank: Omit<CustomRank, 'id' | 'created_at' | 'updated_at'>): Promise<CustomRank> {
  const { data, error } = await supabase
    .from('custom_ranks')
    .insert(rank)
    .select()
    .single();

  if (error) throw error;
  return data as CustomRank;
}

export async function updateRank(id: string, updates: Partial<CustomRank>): Promise<CustomRank> {
  const { data, error } = await supabase
    .from('custom_ranks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomRank;
}

export async function deleteRank(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_ranks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Badges CRUD
export async function getBadgesByTheme(themeId: string): Promise<CustomBadge[]> {
  const { data, error } = await supabase
    .from('custom_badges')
    .select('*')
    .eq('theme_id', themeId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as CustomBadge[];
}

export async function createBadge(badge: Omit<CustomBadge, 'id' | 'created_at' | 'updated_at'>): Promise<CustomBadge> {
  const { data, error } = await supabase
    .from('custom_badges')
    .insert(badge)
    .select()
    .single();

  if (error) throw error;
  return data as CustomBadge;
}

export async function updateBadge(id: string, updates: Partial<CustomBadge>): Promise<CustomBadge> {
  const { data, error } = await supabase
    .from('custom_badges')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomBadge;
}

export async function deleteBadge(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_badges')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Titles CRUD
export async function getTitlesByTheme(themeId: string): Promise<CustomTitle[]> {
  const { data, error } = await supabase
    .from('custom_titles')
    .select('*')
    .eq('theme_id', themeId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as CustomTitle[];
}

export async function createTitle(title: Omit<CustomTitle, 'id' | 'created_at' | 'updated_at'>): Promise<CustomTitle> {
  const { data, error } = await supabase
    .from('custom_titles')
    .insert(title)
    .select()
    .single();

  if (error) throw error;
  return data as CustomTitle;
}

export async function updateTitle(id: string, updates: Partial<CustomTitle>): Promise<CustomTitle> {
  const { data, error } = await supabase
    .from('custom_titles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomTitle;
}

export async function deleteTitle(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_titles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Level Configs CRUD
export async function getLevelConfigsByTheme(themeId: string): Promise<LevelConfig[]> {
  const { data, error } = await supabase
    .from('level_configs')
    .select('*')
    .eq('theme_id', themeId)
    .order('level', { ascending: true });

  if (error) throw error;
  return data as LevelConfig[];
}

export async function upsertLevelConfig(config: Omit<LevelConfig, 'id' | 'created_at'>): Promise<LevelConfig> {
  const { data, error } = await supabase
    .from('level_configs')
    .upsert(config, { onConflict: 'theme_id,level' })
    .select()
    .single();

  if (error) throw error;
  return data as LevelConfig;
}

export async function deleteLevelConfig(id: string): Promise<void> {
  const { error } = await supabase
    .from('level_configs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Bulk operations
export async function generateDefaultLevels(themeId: string, maxLevel: number = 100): Promise<void> {
  const levels = [];
  for (let level = 1; level <= maxLevel; level++) {
    levels.push({
      theme_id: themeId,
      level,
      name: `Nível ${level}`,
      xp_required: Math.floor(100 * Math.pow(level, 1.5)),
      icon: getDefaultLevelIcon(level),
      color: getDefaultLevelColor(level),
      rewards: { coins: level * 10, special_item: null }
    });
  }

  const { error } = await supabase
    .from('level_configs')
    .upsert(levels, { onConflict: 'theme_id,level' });

  if (error) throw error;
}

function getDefaultLevelIcon(level: number): string {
  if (level >= 90) return '🌟';
  if (level >= 80) return '⚡';
  if (level >= 70) return '🔥';
  if (level >= 60) return '💎';
  if (level >= 50) return '👑';
  if (level >= 40) return '🏆';
  if (level >= 30) return '⭐';
  if (level >= 20) return '🎯';
  if (level >= 10) return '📈';
  return '🌱';
}

function getDefaultLevelColor(level: number): string {
  if (level >= 90) return '#fbbf24';
  if (level >= 80) return '#a855f7';
  if (level >= 70) return '#f97316';
  if (level >= 60) return '#06b6d4';
  if (level >= 50) return '#ec4899';
  if (level >= 40) return '#10b981';
  if (level >= 30) return '#6366f1';
  if (level >= 20) return '#3b82f6';
  if (level >= 10) return '#8b5cf6';
  return '#22c55e';
}

// Preset templates
export const THEME_PRESETS = {
  medieval: {
    name: 'Reino Medieval',
    icon: '⚔️',
    color_primary: '#8b4513',
    color_secondary: '#daa520',
    ranks: [
      { name: 'peasant', title: 'Camponês', icon: '🌾', min_level: 1, max_level: 9 },
      { name: 'squire', title: 'Escudeiro', icon: '🛡️', min_level: 10, max_level: 24 },
      { name: 'knight', title: 'Cavaleiro', icon: '⚔️', min_level: 25, max_level: 49 },
      { name: 'knight_silver', title: 'Cavaleiro de Prata', icon: '🗡️', min_level: 50, max_level: 74 },
      { name: 'knight_gold', title: 'Cavaleiro Dourado', icon: '🏅', min_level: 75, max_level: 89 },
      { name: 'lord', title: 'Lorde', icon: '👑', min_level: 90, max_level: 99 },
      { name: 'king', title: 'Rei', icon: '🤴', min_level: 100, max_level: null },
    ]
  },
  space: {
    name: 'Exploração Espacial',
    icon: '🚀',
    color_primary: '#1e3a8a',
    color_secondary: '#7c3aed',
    ranks: [
      { name: 'cadet', title: 'Cadete', icon: '🎖️', min_level: 1, max_level: 9 },
      { name: 'pilot', title: 'Piloto', icon: '🛸', min_level: 10, max_level: 24 },
      { name: 'captain', title: 'Capitão', icon: '👨‍✈️', min_level: 25, max_level: 49 },
      { name: 'commander', title: 'Comandante', icon: '🌟', min_level: 50, max_level: 74 },
      { name: 'admiral', title: 'Almirante', icon: '⭐', min_level: 75, max_level: 89 },
      { name: 'fleet_master', title: 'Mestre da Frota', icon: '🌌', min_level: 90, max_level: 99 },
      { name: 'galactic_emperor', title: 'Imperador Galáctico', icon: '👑', min_level: 100, max_level: null },
    ]
  },
  ninja: {
    name: 'Academia Ninja',
    icon: '🥷',
    color_primary: '#1f2937',
    color_secondary: '#ef4444',
    ranks: [
      { name: 'genin', title: 'Genin', icon: '🌱', min_level: 1, max_level: 14 },
      { name: 'chunin', title: 'Chunin', icon: '🍃', min_level: 15, max_level: 34 },
      { name: 'jonin', title: 'Jōnin', icon: '🌿', min_level: 35, max_level: 54 },
      { name: 'anbu', title: 'ANBU', icon: '🐺', min_level: 55, max_level: 74 },
      { name: 'sannin', title: 'Sannin', icon: '🐍', min_level: 75, max_level: 89 },
      { name: 'kage', title: 'Kage', icon: '🔥', min_level: 90, max_level: 99 },
      { name: 'hokage', title: 'Hokage', icon: '👑', min_level: 100, max_level: null },
    ]
  },
  corporate: {
    name: 'Carreira Corporativa',
    icon: '💼',
    color_primary: '#0ea5e9',
    color_secondary: '#14b8a6',
    ranks: [
      { name: 'intern', title: 'Estagiário', icon: '📋', min_level: 1, max_level: 9 },
      { name: 'analyst', title: 'Analista', icon: '📊', min_level: 10, max_level: 24 },
      { name: 'specialist', title: 'Especialista', icon: '🎯', min_level: 25, max_level: 39 },
      { name: 'coordinator', title: 'Coordenador', icon: '📈', min_level: 40, max_level: 54 },
      { name: 'manager', title: 'Gerente', icon: '👔', min_level: 55, max_level: 74 },
      { name: 'director', title: 'Diretor', icon: '🏢', min_level: 75, max_level: 89 },
      { name: 'vp', title: 'Vice-Presidente', icon: '🎩', min_level: 90, max_level: 99 },
      { name: 'ceo', title: 'CEO', icon: '👑', min_level: 100, max_level: null },
    ]
  },
  fantasy: {
    name: 'Reino Fantástico',
    icon: '🧙',
    color_primary: '#7c3aed',
    color_secondary: '#ec4899',
    ranks: [
      { name: 'apprentice', title: 'Aprendiz', icon: '📖', min_level: 1, max_level: 9 },
      { name: 'mage', title: 'Mago', icon: '🔮', min_level: 10, max_level: 24 },
      { name: 'sorcerer', title: 'Feiticeiro', icon: '⚡', min_level: 25, max_level: 44 },
      { name: 'warlock', title: 'Bruxo', icon: '🌙', min_level: 45, max_level: 64 },
      { name: 'archmage', title: 'Arquimago', icon: '✨', min_level: 65, max_level: 84 },
      { name: 'grandmaster', title: 'Grão-Mestre', icon: '🌟', min_level: 85, max_level: 99 },
      { name: 'supreme', title: 'Supremo', icon: '👑', min_level: 100, max_level: null },
    ]
  }
};

export async function applyPresetToTheme(themeId: string, presetKey: keyof typeof THEME_PRESETS): Promise<void> {
  const preset = THEME_PRESETS[presetKey];
  
  // Update theme with preset colors
  await updateTheme(themeId, {
    icon: preset.icon,
    color_primary: preset.color_primary,
    color_secondary: preset.color_secondary,
  });

  // Create ranks from preset
  for (let i = 0; i < preset.ranks.length; i++) {
    const rank = preset.ranks[i];
    await createRank({
      theme_id: themeId,
      name: rank.name,
      title: rank.title,
      icon: rank.icon,
      color: preset.color_secondary,
      min_level: rank.min_level,
      max_level: rank.max_level,
      xp_multiplier: 1 + (i * 0.1),
      coin_multiplier: 1 + (i * 0.1),
      order_index: i,
      badge_url: null,
      special_perks: [],
      description: null,
    });
  }

  // Generate default levels
  await generateDefaultLevels(themeId);
}
