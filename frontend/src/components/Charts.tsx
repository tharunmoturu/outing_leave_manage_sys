import React from 'react';

// Custom SVG Bar Chart
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export const CustomBarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 5);
  const padding = 30;
  const chartHeight = height - padding * 2;
  const barWidth = 40;
  const gap = 20;
  const chartWidth = data.length * (barWidth + gap) + padding * 2;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="mx-auto w-full max-w-lg overflow-visible"
        height={height}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxValue * ratio);
          return (
            <g key={i} className="opacity-30 dark:opacity-25">
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4"
                className="text-slate-300 dark:text-slate-700"
              />
              <text
                x={padding - 5}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500 font-sans text-[9px] font-bold"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const x = padding + index * (barWidth + gap) + gap / 2;
          const barHeight = (item.value / maxValue) * chartHeight;
          const y = padding + chartHeight - barHeight;

          return (
            <g key={index} className="group cursor-pointer">
              {/* Bar Rect */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill="url(#barGrad)"
                className="transition-all duration-300 hover:fill-indigo-500"
              />
              {/* Value Label */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-indigo-600 dark:fill-indigo-400 font-sans text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {item.value}
              </text>
              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={padding + chartHeight + 15}
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400 font-sans text-[10px] font-medium"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Custom SVG Donut Chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export const CustomDonutChart: React.FC<DonutChartProps> = ({ data, size = 180 }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const center = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.12;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {total === 0 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          ) : (
            data.map((item, index) => {
              const percentage = item.value / total;
              const strokeDashoffset = circumference - percentage * circumference;
              const strokeDasharray = `${circumference} ${circumference}`;
              const rotation = (accumulatedAngle / total) * 360;
              accumulatedAngle += item.value;

              return (
                <circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} ${center} ${center})`}
                  className="transition-all duration-500 hover:scale-[1.03] origin-center"
                  style={{ transformOrigin: 'center' }}
                />
              );
            })
          )}
        </svg>

        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-extrabold text-slate-800 dark:text-white">
            {total}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Students
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
