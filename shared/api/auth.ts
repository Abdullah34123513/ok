import type { User, LoginCredentials, SignupData, AuthResponse } from '../types';
import { simulateDelay } from './utils';
import { mockUsers, mockUserPasswords, mockVendors } from './mockData';

// --- Auth API ---
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await simulateDelay(800);
    const user = mockUsers.find(u => u.email === credentials.email);
    const password = mockUserPasswords.get(credentials.email);

    if (user && password === credentials.password) {
        const vendor = mockVendors.find(v => v.name === user.name);
        return { 
            user, 
            token: `mock-auth-token-${Date.now()}`,
            vendorId: vendor ? vendor.id : undefined,
        };
    } else {
        throw new Error('Invalid email or password.');
    }
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
    await simulateDelay(1000);
    if (mockUsers.some(u => u.email === data.email)) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
    };

    mockUsers.push(newUser);
    mockUserPasswords.set(data.email, data.password);
    
    return { user: newUser, token: `mock-auth-token-${Date.now()}` };
};

export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<void> => {
    await simulateDelay(600);
    const storedPassword = mockUserPasswords.get(email);

    if (!storedPassword || storedPassword !== currentPassword) {
        throw new Error("Your current password is not correct.");
    }

    mockUserPasswords.set(email, newPassword);
    console.log(`Password updated for ${email}`);
};
