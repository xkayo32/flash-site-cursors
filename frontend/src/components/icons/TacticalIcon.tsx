import React from 'react';
import { 
  Users,
  BookOpen,
  Brain,
  Trophy,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Target,
  Award,
  Zap
} from 'lucide-react';

const iconMap = {
  users: Users,
  book: BookOpen,
  brain: Brain,
  trophy: Trophy,
  dollar: DollarSign,
  trending: TrendingUp,
  activity: Activity,
  shield: Shield,
  target: Target,
  award: Award,
  zap: Zap,
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