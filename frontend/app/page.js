"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Test</h1>
      <p className="mb-6">Welcome to the homepage</p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}