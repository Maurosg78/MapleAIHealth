import * as React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center p-2 text-base font-normal rounded-lg ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-primary-700 dark:text-primary-500'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <svg
                className="w-6 h-6 transition duration-75"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
              <span className="ml-3">Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/patients"
              className={({ isActive }) =>
                `flex items-center p-2 text-base font-normal rounded-lg ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-primary-700 dark:text-primary-500'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <svg
                className="w-6 h-6 transition duration-75"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-3">Pacientes</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/alertas"
              className={({ isActive }) =>
                `flex items-center p-2 text-base font-normal rounded-lg ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-primary-700 dark:text-primary-500'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <svg
                className="w-6 h-6 transition duration-75"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
              </svg>
              <span className="ml-3">Alertas Clínicas</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/alertas-avanzadas"
              className={({ isActive }) =>
                `flex items-center p-2 text-base font-normal rounded-lg ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-primary-700 dark:text-primary-500'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <svg
                className="w-6 h-6 transition duration-75"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"></path>
              </svg>
              <span className="ml-3">Alertas Avanzadas</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/ai-history"
              className={({ isActive }) =>
                `flex items-center p-2 text-base font-normal rounded-lg ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-primary-700 dark:text-primary-500'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <svg
                className="w-6 h-6 transition duration-75"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-3">Historial IA</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
