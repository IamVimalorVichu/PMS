// hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Adjust path if needed

/**
 * Custom hook to access the global authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Provides access to:
  // context.user (full User profile or null)
  // context.tokenUser (decoded token data or null)
  // context.isLoading (boolean)
  // context.isAuthenticated (boolean)
  // context.logout (function)
  return context;
};