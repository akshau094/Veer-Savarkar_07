'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">PlacementPortal</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/student" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Student Section
            </Link>
            <Link href="/company" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Company Section
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
