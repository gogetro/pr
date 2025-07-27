import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { AuthUtils } from '../utils/auth';
import { authApi } from '../utils/api';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
};

// Auth Context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = AuthUtils.getToken();
      const user = AuthUtils.getUser();
      
      if (token && user && AuthUtils.isTokenValid(token)) {
        // Check if token is expiring soon and refresh if needed
        if (AuthUtils.isSessionExpiringSoon(token)) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            dispatch({ type: 'LOGOUT' });
            AuthUtils.logout();
            return;
          }
        }
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } else {
        // Clear invalid tokens
        AuthUtils.removeToken();
        dispatch({ type: 'LOGOUT' });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    const checkTokenExpiry = () => {
      if (AuthUtils.isSessionExpiringSoon(state.token)) {
        refreshToken();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authApi.login({ username, password });
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user data
        AuthUtils.setToken(token);
        AuthUtils.setUser(user);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error || 'Login failed' });
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error - please check your connection';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    AuthUtils.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.updateProfile(data);
      
      if (response.success && response.data) {
        const updatedUser = { ...state.user, ...response.data };
        AuthUtils.setUser(updatedUser);
        dispatch({ type: 'SET_USER', payload: updatedUser });
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Profile update failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error - please try again' };
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken();
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        AuthUtils.setToken(token);
        AuthUtils.setUser(user);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      logout();
      return false;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = <div className="text-center py-8 text-gray-500">Access denied</div>,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Please log in to access this page</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="btn-primary"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (requiredRole && !AuthUtils.hasRole(requiredRole as any)) {
    return fallback;
  }

  if (requiredPermission && !AuthUtils.hasPermission(requiredPermission)) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthContext;