import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  login: (username: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await api.getUsers();
        setAllUsers(users);

        // Check stored user id
        const savedUserId = localStorage.getItem('tuneos_user_id');
        if (savedUserId) {
          const found = users.find(u => u.id === savedUserId);
          if (found) {
            setCurrentUser(found);
            return;
          }
        }
        // Default to Rahul Kumar (Bollywood fan) for instant rich recommendations
        if (users.length > 0) {
          setCurrentUser(users[0]);
          localStorage.setItem('tuneos_user_id', users[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial users:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('tuneos_user_id', user.id);
    }
  };

  const login = async (username: string) => {
    const res = await api.login(username);
    setCurrentUser(res.user);
    localStorage.setItem('tuneos_user_id', res.user.id);
    if (!allUsers.some(u => u.id === res.user.id)) {
      setAllUsers(prev => [...prev, res.user]);
    }
  };

  const register = async (data: Partial<User>) => {
    const res = await api.register(data);
    setCurrentUser(res.user);
    localStorage.setItem('tuneos_user_id', res.user.id);
    setAllUsers(prev => [...prev, res.user]);
  };

  const logout = () => {
    localStorage.removeItem('tuneos_user_id');
    if (allUsers.length > 0) {
      setCurrentUser(allUsers[0]);
      localStorage.setItem('tuneos_user_id', allUsers[0].id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        switchUser,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
