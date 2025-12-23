import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role, WageChange } from '../types';

// Mock users for demonstration
const mockUsers: User[] = [
    { id: 1, name: 'Alice', role: Role.Owner, wageRate: 800, wageHistory: [], expectedHours: 40 },
    { id: 2, name: 'Bob', role: Role.Manager, wageRate: 450, wageHistory: [], expectedHours: 45 },
    { id: 3, name: 'Charlie', role: Role.Worker, wageRate: 250, wageHistory: [
        { date: '2025-01-01T10:00:00Z', oldRate: 220, newRate: 250, changedById: 1 }
    ], expectedHours: 40 },
    { id: 4, name: 'Diana', role: Role.Accountant, wageRate: 350, wageHistory: [], expectedHours: 40 },
    { id: 5, name: 'Evan', role: Role.Worker, wageRate: 220, wageHistory: [], expectedHours: 40 },
    { id: 6, name: 'Frank', role: Role.Worker, wageRate: 220, wageHistory: [], expectedHours: 40 },
    { id: 7, name: 'Grace', role: Role.Manager, wageRate: 450, wageHistory: [], expectedHours: 45 },
    { id: 8, name: 'Henry', role: Role.Worker, wageRate: 210, wageHistory: [], expectedHours: 35 },
    { id: 9, name: 'Ivy', role: Role.Worker, wageRate: 210, wageHistory: [], expectedHours: 35 },
    { id: 10, name: 'Jack', role: Role.Worker, wageRate: 210, wageHistory: [], expectedHours: 40 },
];

interface AuthContextType {
    user: User;
    users: User[];
    setUser: (user: User) => void;
    addUser: (userData: Omit<User, 'id'>) => void;
    editUser: (userId: number, updates: Partial<Omit<User, 'id'>>) => void;
    removeUser: (userId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setUser] = useState<User>(mockUsers[1]); // Default to Manager
    const [users, setUsers] = useState<User[]>(mockUsers);
    
    const addUser = (userData: Omit<User, 'id'>) => {
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser: User = { id: newId, ...userData, wageHistory: [], expectedHours: 40 }; // Default expected hours
        setUsers(prev => [...prev, newUser].sort((a,b) => a.id - b.id));
    };

    const editUser = (userId: number, updates: Partial<Omit<User, 'id'>>) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const updatedUser = { ...u, ...updates };

                // Check for wage rate change and log it
                if (updates.wageRate !== undefined && u.wageRate !== updates.wageRate) {
                    const newHistoryEntry: WageChange = {
                        date: new Date().toISOString(),
                        oldRate: u.wageRate || 0,
                        newRate: updates.wageRate,
                        changedById: currentUser.id, // Use the user from context state
                    };
                    updatedUser.wageHistory = [...(u.wageHistory || []), newHistoryEntry]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                }
                return updatedUser;
            }
            return u;
        }));
    };

    const removeUser = (userId: number) => {
        if (currentUser.id === userId) {
            alert("You cannot remove the currently logged-in user.");
            return;
        }
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    return (
        <AuthContext.Provider value={{ user: currentUser, users, setUser, addUser, editUser, removeUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
