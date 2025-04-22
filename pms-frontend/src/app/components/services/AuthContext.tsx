// contexts/AuthContext.tsx
"use client"; // Context needs to be a Client Component boundary

import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { User } from '@/components/types/types'; // Import the *full* User type
import { fetchUserProfileAPI } from './userAPI'; // Import the new API function

interface AuthContextProps {
  user: User | null; // This will hold the FULL user profile from the API
  tokenUser: DecodedTokenUser | null; // Optional: keep raw token data if needed elsewhere
  isLoading: boolean; // Combined loading state (initial token check + API fetch)
  isAuthenticated: boolean; // Derived state: true if user profile is successfully loaded
  logout: () => void; // Function to handle logout
  // Add login function if managed here, or handle login logic elsewhere
}

// Interface for the data initially decoded from the token
interface DecodedTokenUser {
  _id: string; // Expecting user ID in '_id' claim
  first_name?: string; // Optional fields from token
  last_name?: string; // Optional fields from token
  email?: string; // Optional fields from token
  role?: string;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  tokenUser: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [tokenUser, setTokenUser] = useState<DecodedTokenUser | null>(null); // User info just from token
  const [fullUser, setFullUser] = useState<User | null>(null); // Full user profile from API
  const [isLoadingToken, setIsLoadingToken] = useState(true); // Loading state for initial token check
  const [isLoadingProfile, setIsLoadingProfile] = useState(false); // Loading state for API profile fetch

  // 1. Effect for initial token decoding
  useEffect(() => {
    const token = Cookies.get('access_token');
    setIsLoadingToken(true);
    setTokenUser(null); // Reset on check
    setFullUser(null);  // Reset on check

    if (token) {
      try {
        // Ensure your token actually has '_id', 'role' etc. defined in DecodedTokenUser
        const decoded = jwtDecode<DecodedTokenUser>(token);
        setTokenUser(decoded);
      } catch (error) {
        console.error('Error decoding access token:', error);
        // Invalid token, clear cookie? Or let it expire naturally.
        Cookies.remove('access_token');
        setTokenUser(null);
      }
    } else {
      setTokenUser(null);
    }
    setIsLoadingToken(false);
  }, []); // Runs only on mount

  // 2. Effect to fetch full profile when token user ID is available
  useEffect(() => {
    // Only run if we have decoded a user ID from the token AND the full profile isn't already loaded/loading
    if (tokenUser?._id && !fullUser && !isLoadingProfile) {
      const fetchUser = async () => {
        setIsLoadingProfile(true);
        try {
          console.log(`AuthContext: Fetching full profile for user ID: ${tokenUser._id}`);
          const profile = await fetchUserProfileAPI(tokenUser._id);
          setFullUser(profile); // Store the full user profile
          console.log("AuthContext: Full profile loaded:", profile);
        } catch (error: unknown) {
          console.error('AuthContext: Failed to fetch user profile:', (error as Error).message);
          // Handle failure - e.g., maybe the user was deleted?
          // Clear token/logout if profile fetch consistently fails for a valid token ID?
          setFullUser(null);
          // Optionally clear tokenUser and cookie here if fetch fails decisively
          // Cookies.remove('access_token');
          // setTokenUser(null);
        } finally {
          setIsLoadingProfile(false);
        }
      };

      fetchUser();
    } else if (!tokenUser?._id) {
      // If there's no token user ID, ensure fullUser is also null
      setFullUser(null);
    }
    // Dependency array: run when tokenUser changes or loading states reset
  }, [tokenUser, fullUser, isLoadingProfile]);


  const logout = () => {
    Cookies.remove('access_token');
    setTokenUser(null);
    setFullUser(null);
    // Optionally redirect to login page
    // window.location.href = '/login';
    console.log("AuthContext: User logged out.");
  };

  // Combine loading states
  const isLoading = isLoadingToken || isLoadingProfile;
  // User is authenticated only if the full profile has been successfully loaded
  const isAuthenticated = !isLoading && !!fullUser;

  // useMemo to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(() => ({
    user: fullUser,
    tokenUser: tokenUser, // Provide raw token data if needed
    isLoading,
    isAuthenticated,
    logout,
  }), [fullUser, tokenUser, isLoading, isAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};