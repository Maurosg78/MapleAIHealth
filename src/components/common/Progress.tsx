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
      {label && <div className="progress-label">{label}</div>}
      <div className="progress">
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        ></div>
      </div>
      {showValue && <div className="progress-value">{percentage}%</div>}
    </div>
  );
};

export default Progress;
