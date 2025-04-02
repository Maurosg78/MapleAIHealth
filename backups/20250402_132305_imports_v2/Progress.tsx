import React from "react";
import {
   useState, useEffect 
} from "react";interface ProgressProps {
import {
   Button, Input, Select, Modal, Spinner 
} from "@chakra-ui/react";  /**
   * Valor del progreso (0-100)
   */
  value: number;
  /**
   * Etiqueta del progreso
   */
  label?: string;
  /**
   * Si el progreso está en estado indeterminado
   */
  isIndeterminate?: boolean;
  /**
   * Si se muestra el valor del progreso
   */
  showValue?: boolean;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  isIndeterminate = false,
  label = 'Progreso',
  className,
  showValue = true,
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && !isIndeterminate && (
            <span className="text-sm font-medium text-gray-700">{value}%</span>
          )}
        </div>
      )}
      <div className="relative">
        <progress
          value={isIndeterminate ? undefined : value}
          max="100"
          className={twMerge(
            'w-full h-2 rounded-full overflow-hidden',
            '[&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-full',
            '[&::-webkit-progress-value]:bg-primary-600 [&::-webkit-progress-value]:rounded-full',
            '[&::-moz-progress-bar]:bg-primary-600 [&::-moz-progress-bar]:rounded-full',
            isIndeterminate && 'animate-progress-indeterminate',
            className
          )}
          aria-label={label}
        />
      </div>
    </div>
  );
};
