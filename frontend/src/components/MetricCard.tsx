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
  const getIconClass = () => {
    switch (color) {
      case 'indigo': return 'metric-icon-maroon'; // map indigo to maroon
      case 'rose': return 'metric-icon-red';
      case 'amber': return 'metric-icon-amber';
      case 'teal': return 'metric-icon-blue';
      case 'emerald': return 'metric-icon-green';
      default: return 'metric-icon-gray';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`metric-card ${onClick ? 'clickable' : ''}`}
    >
      <div className={`metric-icon ${getIconClass()}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: 1.75 })}
      </div>
      <div>
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value}</div>
      </div>
      {description && (
        <div className="metric-desc">{description}</div>
      )}
    </div>
  );
};
export default MetricCard;
