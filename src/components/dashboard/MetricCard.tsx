export export interface MetricCardProps {
import { 
   useState, useEffect 
 } from "react"
  title: string
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  value: number
import React from "react"
  icon: React.ReactNode;
  description?: string;
}

export const MetricCard = ({
  title,
  value,
  icon,
  description,
}: MetricCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
        {description && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
