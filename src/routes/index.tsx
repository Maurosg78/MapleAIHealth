import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PatientsPage } from '../pages/PatientsPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { AIHistoryPage } from '../pages/AIHistoryPage';
import { EMRPage } from '../pages/EMRPage';
import { TestAIPage } from '../pages/TestAIPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas protegidas */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="patients" element={<PatientsPage />} />
                    <Route path="appointments" element={<AppointmentsPage />} />
                    <Route path="ai-history" element={<AIHistoryPage />} />
                    <Route path="emr/:patientId" element={<EMRPage />} />
                    <Route path="test-ai" element={<TestAIPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
