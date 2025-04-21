import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import Home from './pages/Home';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import FuelLogs from './pages/FuelLogs';
import PartsInventory from './pages/PartsInventory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RequireAuth from './components/auth/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { SiteLayout } from './components/layout/SiteLayout';
import { EquipmentProvider } from './context/EquipmentContext';
import { FarmProvider } from './context/FarmContext';
import { TimeSessionProvider } from './context/TimeSessionContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { GlobalProvider } from './context/GlobalContext';
import useDataInitialization from './hooks/useDataInitialization';

function App() {
  // Initialize data and migrations
  const { isLoading: isDataInitializing, error: dataInitError } = useDataInitialization();

  // You might want to show a loading state while migrations are being applied
  if (isDataInitializing) {
    return <div className="p-8 text-center">Initializing application...</div>;
  }

  if (dataInitError) {
    return <div className="p-8 text-center text-red-500">Error initializing application: {dataInitError.message}</div>;
  }

  return (
    <GlobalProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-center" richColors closeButton />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<RequireAuth><SiteLayout /></RequireAuth>}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/equipment" element={
                <FarmProvider><EquipmentProvider><EquipmentList /></EquipmentProvider></FarmProvider>} />
              <Route path="/equipment/:id" element={
                <FarmProvider><EquipmentProvider><EquipmentDetail /></EquipmentProvider></FarmProvider>} />
              <Route path="/maintenance" element={
                <FarmProvider><MaintenanceProvider><EquipmentProvider><MaintenanceSchedule /></EquipmentProvider></MaintenanceProvider></FarmProvider>} />
              <Route path="/fuel-logs" element={
                <FarmProvider><EquipmentProvider><FuelLogs /></EquipmentProvider></FarmProvider>} />
              <Route path="/parts-inventory" element={
                <FarmProvider><EquipmentProvider><PartsInventory /></EquipmentProvider></FarmProvider>} />
              <Route path="/time-sessions" element={
                <FarmProvider><TimeSessionProvider><EquipmentProvider><EquipmentList /></EquipmentProvider></TimeSessionProvider></FarmProvider>} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GlobalProvider>
  );
}

export default App;
