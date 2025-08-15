'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi client-side sebelum mengirim ke server
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Handle non-JSON responses
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Invalid server response');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      if (!data.token) {
        throw new Error('Authentication token missing');
      }

      // Simpan token dan user data
      localStorage.setItem('token', data.token);
      
      try {
        // Decode token untuk mendapatkan payload
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        
        if (!payload.userId) {
          throw new Error('Invalid token payload');
        }
        
        localStorage.setItem('userId', payload.userId);
        
        // Redirect ke dashboard
        router.push('/dashboard');
        router.refresh(); // Memastikan halaman direfresh
        
      } catch (tokenError) {
        console.error('Token processing error:', tokenError);
        throw new Error('Authentication processing failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      
      // Clear credentials on error
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-indigo-100 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a 
                href="/forgot-password" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 text-white font-medium rounded-lg transition duration-200 ${
              isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Don{"'"}t have an account?{' '}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
              onClick={(e) => isLoading && e.preventDefault()}
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}