/**
 * Renders a lucide icon by name from the gamification ICON_MAP.
 */

import { ICON_MAP } from '../lib/gamification';
import { Zap } from 'lucide-react';

interface Props {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function GamificationIcon({ name, size = 14, color, strokeWidth = 1.5 }: Props) {
  const Icon = ICON_MAP[name] || Zap;
  return <Icon size={size} strokeWidth={strokeWidth} color={color} />;
}
