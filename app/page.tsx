'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ConnectionCenter } from '@/components/dashboard/connection-center';

export default function Home() {
  const [activeTab, setActiveTab] = useState('connections');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <main id="main-content">
        {activeTab === 'connections' && <ConnectionCenter />}
      </main>
    </DashboardLayout>
  );
}
