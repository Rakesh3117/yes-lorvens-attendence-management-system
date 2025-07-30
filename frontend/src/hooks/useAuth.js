import { useSelector, useDispatch } from "react-redux";
import {
  login,
  register,
  getMe,
  updateProfile,
  changePassword,
  logout,
  clearError,
} from "../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: (email, password) => dispatch(login({ email, password })),
    register: (userData) => dispatch(register(userData)),
    getMe: () => dispatch(getMe()),
    updateProfile: (profileData) => dispatch(updateProfile(profileData)),
    changePassword: (passwordData) => dispatch(changePassword(passwordData)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};
