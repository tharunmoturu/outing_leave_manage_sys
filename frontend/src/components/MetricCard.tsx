import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'rose' | 'amber' | 'teal' | 'emerald' | 'slate';
  description?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
  onClick,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'indigo':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
          hover: 'hover:shadow-indigo-500/5 hover:border-indigo-500/20',
          gradient: 'from-indigo-600 to-indigo-500',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
          hover: 'hover:shadow-rose-500/5 hover:border-rose-500/20',
          gradient: 'from-rose-600 to-rose-500',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
          hover: 'hover:shadow-amber-500/5 hover:border-amber-500/20',
          gradient: 'from-amber-600 to-amber-500',
        };
      case 'teal':
        return {
          bg: 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400',
          hover: 'hover:shadow-teal-500/5 hover:border-teal-500/20',
          gradient: 'from-teal-600 to-teal-500',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          hover: 'hover:shadow-emerald-500/5 hover:border-emerald-500/20',
          gradient: 'from-emerald-600 to-emerald-500',
        };
      default:
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400',
          hover: 'hover:shadow-slate-500/5 hover:border-slate-500/20',
          gradient: 'from-slate-600 to-slate-500',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      onClick={onClick}
      className={`glass-panel flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${colors.hover}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </span>
          <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-3xl">
            {value}
          </span>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-transparent shadow-inner ${colors.bg}`}>
          {icon}
        </div>
      </div>
      {description && (
        <div className="mt-4 flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {description}
        </div>
      )}
    </div>
  );
};
export default MetricCard;
