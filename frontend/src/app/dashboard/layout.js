// Dashboard layout
import Sidebar from '@CASUSGROEP1/components/Sidebar';
import Header from '@CASUSGROEP1/components/Header';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
