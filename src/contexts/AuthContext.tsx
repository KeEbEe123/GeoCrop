import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { SupabaseService } from '@/services/supabase';
import { emailServiceClient } from '@/services/emailService';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: User['role'], location: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simple hash for demo purposes (in production, use proper hashing)
      const passwordHash = btoa(password);
      const user = await SupabaseService.authenticateUser(email, passwordHash);
      
      if (user) {
        handleSetUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: User['role'], location: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = await SupabaseService.getUserByEmail(email);
      if (existingUser) {
        return false; // User already exists
      }

      // Simple hash for demo purposes (in production, use proper hashing)
      const passwordHash = btoa(password);
      
      // Create user in database
      const newUser = await SupabaseService.createUser({
        name,
        email,
        role,
        location,
        phone: '',
        avatar: '',
        verified: false,
        rating: 0,
        passwordHash
      });

      if (newUser) {
        // Set user in context
        handleSetUser(newUser);
        
        // Send welcome email (don't await to prevent blocking registration)
        console.log('🚀 Attempting to send welcome email for new user:', email);
        emailServiceClient.sendWelcomeEmail({
          name,
          email,
          role,
          location
        }).then((result) => {
          if (result.success) {
            console.log('✅ Welcome email sent successfully');
          } else {
            console.warn('⚠️ Welcome email failed to send:', result.message);
          }
        }).catch((error) => {
          console.warn('⚠️ Welcome email service error:', error);
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    handleSetUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};