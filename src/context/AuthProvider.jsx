import { useReducer, useEffect } from 'react';
import AuthContext from './AuthContext';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null, // store user profile
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'STOP_LOADING':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI
        .verify()
        .then((res) => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.user });
          socketService.connect();
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('adminAuthenticated');
        })
        .finally(() => {
          dispatch({ type: 'STOP_LOADING' });
        });
    } else {
      dispatch({ type: 'STOP_LOADING' });
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // console.log('Login response:', response);
      if (!response.data || !response.data.token) {
        throw new Error('Invalid login response');
      }
      const { token, user } = response.data;
      // console.log('Login successful:', user);
      if (!user || !user.id) {
        throw new Error('User data is incomplete');
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      localStorage.setItem('adminAuthenticated', 'true');
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });

      socketService.connect(user.id);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminAuthenticated');
    socketService.disconnect();
  };

  // console.log('AuthProvider state:', state.user);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        user: state.user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
