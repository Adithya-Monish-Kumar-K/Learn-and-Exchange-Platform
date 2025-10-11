import React from 'react';
import { Outlet } from 'react-router-dom';
import ModernSidebar from '../components/Sidebar';

const Layout: React.FC = () => {
  return (
    <div
      style={{ background: 'var(--background)' }}
      className="min-h-screen flex"
    >
      <ModernSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
