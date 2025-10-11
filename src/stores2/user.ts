import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { Api } from "@/api/api";
import { User, UserApi, type UserData, type CredentialsData, type LoginResponse } from "@/api/user";

const SECURITY_TOKEN_KEY = "security-token";

export const useUserStore = defineStore("user", () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);

    const isLoggedIn = computed(() => {
        return token.value != null;
    });

    function initialize(): void {
        const storedToken = localStorage.getItem(SECURITY_TOKEN_KEY);
        if (storedToken) setToken(storedToken);
    }

    function setToken(value: string | null): void {
        token.value = value;
        Api.token = value;
    }

    function updateToken(value: string, rememberMe: boolean): void {
        if (rememberMe) localStorage.setItem(SECURITY_TOKEN_KEY, value);
        setToken(value);
    }

    function removeToken(): void {
        localStorage.removeItem(SECURITY_TOKEN_KEY);
        setToken(null);
    }

    async function login(credentials: CredentialsData, rememberMe: boolean): Promise<LoginResponse> {
        const result = await UserApi.login(credentials);
        updateToken(result.token, rememberMe);
        return result;
    }

    async function logout(): Promise<void> {
        try {
            user.value = null;
            return await UserApi.logout();
        } finally {
            removeToken();
        }
    }

    async function getProfile(): Promise<User> {
        if (user.value) return user.value;
        const result = await UserApi.getProfile();
        user.value = Object.assign(new User(result), result);
        return user.value;
    }

    return { user, isLoggedIn, initialize, login, logout, getProfile };
});
