'use client';

import { useRouter } from 'next/navigation';
import { tokenService } from '../utils/auth';

export default function LogoutButton({ className = '' }) {
  const router = useRouter();

  const handleLogout = () => {
    tokenService.removeToken();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors ${className}`}
    >
      Logout
    </button>
  );
}
