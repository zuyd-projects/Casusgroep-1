// Dashboard layout
import Sidebar from "@CASUSGROEP1/components/Sidebar";
import Header from "@CASUSGROEP1/components/Header";
import ProtectedRoute from "@CASUSGROEP1/components/ProtectedRoute";
import '../../styles/globals.css';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header spans full width */}
          <Header />

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
