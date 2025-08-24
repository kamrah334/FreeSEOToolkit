export interface ToolCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  href: string;
}

export interface NavItem {
  href: string;
  label: string;
}
