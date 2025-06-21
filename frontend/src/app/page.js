
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl">
        <div className="text-center sm:text-left w-full">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Order Management System
          </h1>
          <h2 className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            by Casusgroep 1
          </h2>
          <p className="text-lg mb-8">
            A comprehensive solution for managing your orders, customers, and
            inventory in one place. Streamline your business operations with our
            intuitive interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Customer Management</h3>
            <p>
              Track and manage all your customer data efficiently. Update
              profiles, view order history, and maintain relationships.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Order Processing</h3>
            <p>
              Create, track, and fulfill orders with ease. Get real-time updates
              on order status and delivery information.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Analytics</h3>
            <p>
              Get valuable insights into your business with comprehensive
              reporting tools and customizable dashboards.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">User-Friendly Interface</h3>
            <p>
              Designed with simplicity in mind, our system is intuitive and easy
              to use for all team members.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 sm:w-auto"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 hover:bg-green-700 text-white gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 sm:w-auto"
            href="/register"
          >
            Register
          </Link>
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          © 2025 Casusgroep 1. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
