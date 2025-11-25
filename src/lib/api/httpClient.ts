import { BackendLoginResponse, BackendCheckStatusResponse } from '../types';

/**
 * HTTP Client for API communication
 * Handles base URL configuration for development and production environments
 */
class HttpClient {
    private baseUrl: string;

    constructor() {
        // Read from environment variable or fallback to localhost
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    }

    /**
     * Login user with username and password
     * @param userName - User's username
     * @param password - User's password
     * @returns Promise with login response including token
     */
    async login(userName: string, password: string): Promise<BackendLoginResponse> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, password }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Credenciales inválidas');
            }
            throw new Error('Error al iniciar sesión');
        }

        return response.json();
    }

    /**
     * Check authentication status and renew token
     * @param token - Current JWT token
     * @returns Promise with renewed token and user info
     */
    async checkAuthStatus(token: string): Promise<BackendCheckStatusResponse> {
        const response = await fetch(`${this.baseUrl}/auth/check-status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token inválido o expirado');
            }
            throw new Error('Error al verificar autenticación');
        }

        return response.json();
    }

    /**
     * Get the configured base URL
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }
}

// Singleton instance
export const httpClient = new HttpClient();
