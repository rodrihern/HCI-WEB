import { Api } from "./api";

export interface UserData {
    id?: number;
    name: string;
    surname: string;
    email: string;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginResponse {
    token: string;
}

export interface CredentialsData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    surname: string;
    email: string;
    password: string;
    metadata?: Record<string, any>;
}

export interface VerifyAccountData {
    code: string;
}

export interface ResetPasswordData {
    code: string;
    password: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export class UserApi {
    static getUrl(slug?: string): string {
        return `${Api.baseUrl}/users${slug ? `/${slug}` : ""}`;
    }

    static async register(data: RegisterData, controller?: AbortController): Promise<UserData> {
        return await Api.post<UserData>(UserApi.getUrl("register"), false, data, controller);
    }

    static async login(credentials: CredentialsData, controller?: AbortController): Promise<LoginResponse> {
        return await Api.post<LoginResponse>(UserApi.getUrl("login"), false, credentials, controller);
    }

    static async logout(controller?: AbortController): Promise<void> {
        return await Api.post<void>(UserApi.getUrl("logout"), true, undefined, controller);
    }

    static async getProfile(controller?: AbortController): Promise<UserData> {
        return await Api.get<UserData>(UserApi.getUrl("profile"), true, controller);
    }

    static async updateProfile(data: Partial<UserData>, controller?: AbortController): Promise<UserData> {
        return await Api.put<UserData>(UserApi.getUrl("profile"), true, data, controller);
    }

    static async verifyAccount(data: VerifyAccountData, controller?: AbortController): Promise<void> {
        return await Api.post<void>(UserApi.getUrl("verify-account"), false, data, controller);
    }

    static async sendVerification(email: string, controller?: AbortController): Promise<void> {
        return await Api.post<void>(UserApi.getUrl(`send-verification?email=${encodeURIComponent(email)}`), false, undefined, controller);
    }

    static async forgotPassword(email: string, controller?: AbortController): Promise<void> {
        return await Api.post<void>(UserApi.getUrl(`forgot-password?email=${encodeURIComponent(email)}`), false, undefined, controller);
    }

    static async resetPassword(data: ResetPasswordData, controller?: AbortController): Promise<void> {
        return await Api.post<void>(UserApi.getUrl("reset-password"), false, data, controller);
    }

    static async changePassword(data: ChangePasswordData, controller?: AbortController): Promise<void> {
        return await Api.post<void>(UserApi.getUrl("change-password"), true, data, controller);
    }
}

export class Credentials {
    email: string;
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}

export class User {
    id?: number;
    name: string;
    surname: string;
    email: string;
    metadata: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: UserData) {
        if (data.id) {
            this.id = data.id;
        }
        this.name = data.name;
        this.surname = data.surname;
        this.email = data.email;
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}
