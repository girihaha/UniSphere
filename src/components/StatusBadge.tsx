import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { PostStatus } from '../data/moderation';

interface StatusBadgeProps {
  status: PostStatus;
  size?: 'sm' | 'md';
}

const config: Record<PostStatus, { label: string; color: string; bg: string; border: string; Icon: typeof Clock }> = {
  pending: {
    label: 'Pending Review',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    Icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.25)',
    Icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.1)',
    border: 'rgba(244,63,94,0.25)',
    Icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, color, bg, border, Icon } = config[status];
  const iconSize = size === 'sm' ? 10 : 12;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const px = size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold ${px} ${textSize}`}
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <Icon size={iconSize} />
      {label}
    </div>
  );
}
