import React from "react";
import { useState, useEffect } from "react";const navigation = [
import { Button, Input, Select, Modal, Spinner } from "@chakra-ui/react";  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Pacientes', href: '/patients', icon: '👥' },
  { name: 'Citas', href: '/appointments', icon: '📅' },
  { name: 'Historial IA', href: '/ai-history', icon: '🤖' },
];

export const Sidebar: React.FC = () => {



  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            MapleAIHealth
          </h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <Button variant="secondary" onClick={logout} className="w-full">
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};
