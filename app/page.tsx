'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">OmniDeploy</h1>
          <p className="mt-2 text-gray-600">Modern warehouse management solution</p>
        </div>
        
        <div className="space-y-4">
          <Link href="/dashboard/" className="block w-full py-2 px-4 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
            Go to Dashboard
          </Link>
          
          <Link href="/auth/login/" className="block w-full py-2 px-4 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
} 