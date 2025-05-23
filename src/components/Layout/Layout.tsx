
import React from 'react';
import BottomNav from './BottomNav';
import { useIsMobile } from '../../hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-900">
      <main className={isMobile ? "pb-20" : "pb-6"}>
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
};

export default Layout;
