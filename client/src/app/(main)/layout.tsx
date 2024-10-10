'use client';

import Sidebar from '@/components/global/sidebar';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={cn('transition-all', sidebarOpen ? 'ml-64' : 'ml-16')}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
