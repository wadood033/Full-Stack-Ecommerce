import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import {Sidebar} from '@/components/dashboard/Sidebar';
import {Topbar} from '@/components/dashboard/Topbar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <ClerkProvider>
      <div className="min-h-screen -my-17 flex bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <main className="p-6 bg-white shadow-inner flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ClerkProvider>
  );
}
