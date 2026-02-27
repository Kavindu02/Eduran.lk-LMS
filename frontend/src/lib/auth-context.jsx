import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, getUserByEmail, updateUser, initializeDefaultData } from './storage';
const AuthContext = createContext(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Initialize default data if it doesn't exist
        initializeDefaultData();
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Now handling JWT formatted response { token, user }
                const userObj = data.user || data;
                if (data.token) localStorage.setItem('auth_token', data.token);
                
                setCurrentUser(userObj);
                setUser(userObj);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Connection error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setCurrentUser(null);
        setUser(null);
    };

    const register = async (email, password, name, profileData) => {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role: 'student',
                    ...profileData
                })
            });
            
            if (response.ok) {
                const newUser = await response.json();
                return { success: true, data: newUser };
            } else {
                const error = await response.json();
                return { success: false, message: error.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Could not connect to the server' };
        }
    };
    const updateCurrentUser = (updates) => {
        if (user) {
            const updated = updateUser(user.id, updates);
            if (updated) {
                setCurrentUser(updated);
                setUser(updated);
            }
        }
    };
    return (<AuthContext.Provider value={{ user, isLoading, login, logout, register, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
