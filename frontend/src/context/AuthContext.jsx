import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const response = await authAPI.getMe();
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // If fetching me fails with 401, it's handled by axios interceptor
            return null;
        }
    }, []);

    useEffect(() => {
        if (token && !user) {
            fetchUser();
        }
    }, [token, user, fetchUser]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authAPI.login({ email, password });
            const { access_token } = response.data;

            // Store token
            localStorage.setItem('token', access_token);
            setToken(access_token);

            // Fetch full user details immediately
            const userInfo = await fetchUser();

            return { success: true, user: userInfo };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await authAPI.register({ username, email, password });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        fetchUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
