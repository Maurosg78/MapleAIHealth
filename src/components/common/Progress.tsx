import React from 'react';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100,
  label,
  showValue = false
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="progress-container">
      {label && <div className="progress-label" id="progress-label">{label}</div>}
      <progress 
        className="progress-bar"
        value={value}
        max={max}
        aria-labelledby={label ? "progress-label" : undefined}
      />
      {showValue && <div className="progress-value">{percentage}%</div>}
    </div>
  );
};

export default Progress;
