
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-7xl w-full">
          <div className="text-center w-full">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
              🚀 Enterprise Resource Planning Platform
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ERPNumber1
            </h1>
            <h2 className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-300 mb-8 font-light">
              Complete Business Process Management Solution
            </h2>
            <p className="text-xl mb-12 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A comprehensive ERP system with advanced process mining, real-time analytics, 
              and cloud-native architecture. Built with modern technologies for scalable business operations.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-16">
            {/* Backend API Features */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">RESTful API Backend</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive ASP.NET Core backend with 11+ specialized controllers for complete business management.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <li>• Order & Inventory Management</li>
                <li>• Product & Material Tracking</li>
                <li>• Supplier & Delivery Control</li>
                <li>• JWT Authentication & Security</li>
              </ul>
            </div>

            {/* Process Mining */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Process Mining & Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advanced process discovery and analysis with real-time event logging and XES export support.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <li>• Automatic Event Capture</li>
                <li>• Process Discovery & Analysis</li>
                <li>• Bottleneck Identification</li>
                <li>• XES Format Export</li>
              </ul>
            </div>

            {/* Frontend Interface */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Modern React Frontend</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Responsive Next.js interface with Tailwind CSS, featuring dark mode and intuitive dashboards.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <li>• Next.js 15 with React 18</li>
                <li>• Tailwind CSS Styling</li>
                <li>• Dark/Light Mode Support</li>
                <li>• Real-time Data Visualization</li>
              </ul>
            </div>

            {/* Cloud Infrastructure */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Azure Cloud Infrastructure</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scalable Terraform-managed infrastructure on Microsoft Azure with automated deployment.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <li>• Terraform Infrastructure as Code</li>
                <li>• Azure Virtual Networks</li>
                <li>• Container Orchestration</li>
                <li>• Automated CI/CD Pipeline</li>
              </ul>
            </div>

            {/* Production Simulation */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Production Simulation</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advanced simulation engine for production planning with 3D visualization and round-based execution.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <li>• 3D Product Visualization</li>
                <li>• Round-based Production</li>
                <li>• Real-time Progress Tracking</li>
                <li>• Performance Analytics</li>
              </ul>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s8-1.79 8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Database & Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Robust SQL Server database with Entity Framework Core and comprehensive business analytics.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <li>• SQL Server with EF Core</li>
                <li>• Business Statistics</li>
                <li>• Data Migrations</li>
                <li>• Performance Monitoring</li>
              </ul>
            </div>
          </div>

          {/* Technology Stack Section */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-16">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Technology Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚛️</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Frontend</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Next.js • React • Tailwind</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Backend</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">ASP.NET Core • C# • JWT</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗄️</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Database</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">SQL Server • EF Core</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">☁️</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Infrastructure</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Azure • Terraform • Docker</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex gap-6 items-center flex-col sm:flex-row mt-8">
            <Link
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-base h-14 px-8 transform hover:scale-105 shadow-lg hover:shadow-xl"
              href="/login"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Get Started
            </Link>
            <Link
              className="rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-base h-14 px-8 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              href="/dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Dashboard
            </Link>
            <Link
              className="rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-base h-14 px-8 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              href="/register"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sign Up
            </Link>
          </div>
        </main>
        
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Casusgroep 1 - ERPNumber1. Built with modern technologies for production line innovation.
          </span>
        </footer>
      </div>
    </div>
  );
}
