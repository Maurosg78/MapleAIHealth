import { Activity } from '@/types/dashboard';;;;;

interface RecentActivitiesProps {
    activities: Activity[];
}

export const RecentActivities = ({ activities }: RecentActivitiesProps): void => {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Actividades Recientes
                </h3>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                        <li key={activity.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-600 truncate">
                                    {activity.description}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {new Date(activity.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
