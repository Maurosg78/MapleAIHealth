import { 
   useState, useEffect 
 } from 'react'
import React from 'react'
export const Layout: React.FC = () => {
  import {
   Button, Input, Select, Modal, Spinner 
} from '@chakra-ui/react';
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
