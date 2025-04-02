import React from 'react';
import {
   useState, useEffect 
} from 'react';
export const Header: React.FC = () => {
  import {
   Button, Input, Select, Modal, Spinner 
} from '@chakra-ui/react';

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              MapleAI Health
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">
              {user?.name}
            </span>
            <Button variant="outline" onClick={logout} className="text-sm">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
