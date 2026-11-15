import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BackgroundPaths from './BackgroundPaths';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen page-background">
      <div className="fixed inset-0 -z-10">
        <BackgroundPaths opacity={0.12} count={20} />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
