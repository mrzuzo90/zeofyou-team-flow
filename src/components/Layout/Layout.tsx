
import React from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
