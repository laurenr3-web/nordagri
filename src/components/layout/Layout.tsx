
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 ml-0 md:ml-64 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
