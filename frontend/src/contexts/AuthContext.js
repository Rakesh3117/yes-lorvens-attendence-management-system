import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { 
  getLoginErrorMessage, 
  getRegistrationErrorMessage, 
  getProfileUpdateErrorMessage, 
  getPasswordChangeErrorMessage 
} from '../utils/errorHandler';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: !!localStorage.getItem('token'), // Only loading if there's a token to check
  error: null,
};

const authReducer = (state, action) => {
  console.log('Auth reducer - action:', action.type, 'payload:', action.payload);
  
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      console.log('AUTH_SUCCESS - setting isAuthenticated to true');
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await authService.getMe();
          const user = response.data.data.user;
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: user,
              token: state.token,
            },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          
          let errorMessage = 'Authentication failed';
          if (error.response?.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (!error.response) {
            errorMessage = 'Network error. Please check your internet connection.';
          }
          
          dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        }
      } else {
        // No token, set loading to false immediately
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, [state.token]); // Add state.token as dependency

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Login function called with:', email);
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(email, password);
      
      const { token, data } = response.data;
      const user = data.user;
      console.log('Login response:', { token: !!token, user: user?.email, role: user?.role });
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      console.log('Login dispatch completed');
      toast.success('Login successful!');
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getLoginErrorMessage(error);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      
      // Don't automatically log in after registration
      // Just show success message and return success
      dispatch({ type: 'AUTH_FAILURE', payload: null }); // Reset loading state
      
      toast.success('Registration successful! Please sign in to continue.');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getRegistrationErrorMessage(error);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      const user = response.data.data.user;
      dispatch({
        type: 'UPDATE_USER',
        payload: user,
      });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = getProfileUpdateErrorMessage(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      
      // Update token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: state.user,
            token: response.data.token,
          },
        });
      }
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = getPasswordChangeErrorMessage(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 