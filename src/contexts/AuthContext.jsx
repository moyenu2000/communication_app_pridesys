import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, registerUser, fetchCurrentUser } from '../services/authServices';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await fetchCurrentUser();
                console.log('userData:', userData);
                setUser(userData);
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);


    // Login handler
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            await loginUser(credentials);
            const userData = await fetchCurrentUser();
            setUser(userData);
            navigate('/channels');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };


    // Logout handler
    const logout = async () => {
        setIsLoading(true);
        try {
            await logoutUser();
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Registration handler
    const register = async (userData) => {
        try {
            const newUser = await registerUser(userData);
            await login(userData);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}