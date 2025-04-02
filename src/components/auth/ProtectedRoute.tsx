import { 
   useState, useEffect 
 } from "react"
interface ProtectedRouteProps {
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  children: React.ReactNode
import React from "react"
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
