export interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'executive' | 'bookkeeper' | 'manager';
}
export interface AuthResponse {
    user: User;
    token: string;
    stores?: string[];
}
export declare const authService: {
    login(email: string, password: string): Promise<AuthResponse>;
    verifyToken(token: string): Promise<any>;
    getUserById(userId: number): Promise<User | null>;
    getUserStores(userId: number): Promise<string[]>;
};
//# sourceMappingURL=authService.d.ts.map