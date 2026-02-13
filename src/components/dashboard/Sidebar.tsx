'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, Target, Receipt, Lightbulb, TrendingUp } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Budget', href: '/dashboard/budget', icon: Wallet },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Recommendations', href: '/dashboard/recommendations', icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow glass-card border-r border-white/10 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 py-6">
          <TrendingUp className="w-8 h-8 text-primary" />
          <span className="ml-2 text-xl font-bold gradient-text">FinancePlanner</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'gradient-primary text-white shadow-lg'
                    : 'text-text/70 hover:bg-white/5 hover:text-text'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}