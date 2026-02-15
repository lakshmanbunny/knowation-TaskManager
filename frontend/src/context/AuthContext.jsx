import { createContext, useContext, useState } from 'react';
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
    const [loading] = useState(false);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { access_token } = response.data;

            // Store token
            localStorage.setItem('token', access_token);
            setToken(access_token);

            // You might want to fetch user details here
            // For now, storing minimal info
            const userInfo = { email };
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            return { success: false, error: message };
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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
