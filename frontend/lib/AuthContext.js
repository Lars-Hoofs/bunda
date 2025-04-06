"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Create the auth context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Function to fetch the current user
  const fetchUserProfile = async () => {
    try {
      const response = await api.auth.getMijnAccount();
      setUser(response.gebruiker);
      setIsAuthenticated(true);
      return response.gebruiker;
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Check authentication status when the component mounts
  useEffect(() => {
    // Skip on server-side rendering
    if (typeof window === 'undefined') return;

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log("AuthContext: Checking token", !!token);
      
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const userData = await fetchUserProfile();
        console.log("AuthContext: User authenticated", userData);
      } catch (error) {
        // Handle token expiration
        if (error.response?.status === 401) {
          console.log("AuthContext: Token expired, trying to refresh");
          try {
            // Try to refresh the token
            await api.auth.vernieuwToken();
            // If successful, fetch the user again
            const userData = await fetchUserProfile();
            console.log("AuthContext: Token refreshed, user fetched", userData);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setError('Uw sessie is verlopen. Log opnieuw in.');
          }
        } else {
          console.error("AuthContext: Error during auth check", error);
          setError('Er is een fout opgetreden bij het ophalen van uw gegevens.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    console.log("AuthContext: Login attempt");
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.inloggen(credentials);
      console.log("AuthContext: Login successful, token received");
      
      // Fetch user data after successful login
      const userData = await fetchUserProfile();
      console.log("AuthContext: User profile fetched after login", userData);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setError('Inloggen mislukt');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext: Logging out");
    api.auth.uitloggen();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Function to refresh user data
  const refreshUser = async () => {
    console.log("AuthContext: Refreshing user data");
    try {
      return await fetchUserProfile();
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  // Context value to provide
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}