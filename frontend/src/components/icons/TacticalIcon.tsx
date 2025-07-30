import React from 'react';

// Import all tactical SVGs
import UsersTactical from '@/assets/icons/tactical/users-tactical.svg?react';
import BookTactical from '@/assets/icons/tactical/book-tactical.svg?react';
import BrainTactical from '@/assets/icons/tactical/brain-tactical.svg?react';
import TrophyTactical from '@/assets/icons/tactical/trophy-tactical.svg?react';
import DollarTactical from '@/assets/icons/tactical/dollar-tactical.svg?react';
import TrendingTactical from '@/assets/icons/tactical/trending-tactical.svg?react';
import ActivityTactical from '@/assets/icons/tactical/activity-tactical.svg?react';

const iconMap = {
  users: UsersTactical,
  book: BookTactical,
  brain: BrainTactical,
  trophy: TrophyTactical,
  dollar: DollarTactical,
  trending: TrendingTactical,
  activity: ActivityTactical,
};

export type TacticalIconName = keyof typeof iconMap;

interface TacticalIconProps {
  name: TacticalIconName;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function TacticalIcon({ name, className = '', size = 'md' }: TacticalIconProps) {
  const Icon = iconMap[name];
  
  if (!Icon) {
    console.warn(`Tactical icon "${name}" not found`);
    return null;
  }

  return <Icon className={`${sizeClasses[size]} ${className}`} />;
}

export default TacticalIcon;