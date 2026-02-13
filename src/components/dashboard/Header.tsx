'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import type { User } from '@/types';

interface HeaderProps {
  user: User;
  onMenuToggle?: () => void;
}

export function Header({ user, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('token');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background/80 backdrop-blur-lg border-b border-primary/20 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-text hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300 border border-primary/20"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text">{user.name}</p>
                <p className="text-xs text-text/60">{user.email}</p>
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-background/95 backdrop-blur-lg rounded-lg border border-primary/20 shadow-xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-primary/20">
                  <p className="text-sm font-medium text-text">{user.name}</p>
                  <p className="text-xs text-text/60 mt-1">{user.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors text-text"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}