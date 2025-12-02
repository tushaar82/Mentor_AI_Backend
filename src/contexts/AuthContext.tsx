'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'parent';
  is_student?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (emailOrUsername: string, password: string, isStudent?: boolean) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string, isStudent: boolean = false) => {
    // Use appropriate login endpoint
    const response = isStudent 
      ? await authAPI.studentLogin(emailOrUsername, password)
      : await authAPI.login(emailOrUsername, password);
    
    const { token, parent_id, student_id, child_id, email: userEmail, username, name, is_student } = response.data;
    
    // Determine if this is a student or parent login
    // Priority: explicit isStudent flag > is_student from response > presence of student_id/child_id
    const isStudentLogin = isStudent || is_student === true || (!!student_id && !parent_id) || (!!child_id && !parent_id);
    
    const userData = {
      id: isStudentLogin ? (student_id || child_id) : parent_id,
      email: userEmail || `${username}@student.local`,
      full_name: name || username || userEmail?.split('@')[0] || 'User',
      role: isStudentLogin ? 'student' as const : 'parent' as const,
      is_student: isStudentLogin
    };
    
    console.log('Login response:', { parent_id, student_id, child_id, is_student, isStudentLogin });
    console.log('User data set:', userData);
    
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    const { parent_id, email, phone, message } = response.data;
    
    if (parent_id) {
      const userData = {
        id: parent_id,
        email: email,
        full_name: data.name,
        mobile_number: data.mobile_number,
        role: 'parent' as const
      };
      
      // Note: Simple registration doesn't return a token, user needs to login
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Auto-login after registration to get a token
      try {
        const loginResponse = await authAPI.login(data.email_address, data.password);
        const { token } = loginResponse.data;
        
        if (token) {
          setToken(token);
          localStorage.setItem('token', token);
        }
      } catch (loginErr) {
        console.error('Auto-login after registration failed:', loginErr);
      }
    } else {
      throw new Error(message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
