import React from 'react';
import { Activity } from '../../types/dashboard';

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'patient':
        return '👤';
      case 'task':
        return '✓';
      case 'ai_query':
        return '🤖';
      default:
        return '•';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <span className="text-lg">{getActivityIcon(activity.type)}</span>
          <div>
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
