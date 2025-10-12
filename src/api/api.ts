export class Api {
    static token: string | null = null;

    static get baseUrl(): string {
        return "http://localhost:8080/api";
    }

    static get timeout(): number {
        return 60 * 1000;
    }

    static async fetch<T = any>(
        url: string,
        secure: boolean,
        init: RequestInit = {},
        controller?: AbortController
    ): Promise<T> {
        if (secure) {
            if (!Api.token) {
                console.warn('⚠️ [API] Secure request without token:', url);
            }
            if (Api.token) {
                if (!init.headers) {
                    init.headers = {};
                }
                (init.headers as Record<string, string>)["Authorization"] = `bearer ${Api.token}`;
            }
        }

        controller = controller || new AbortController();
        init.signal = controller.signal;
        const timer = setTimeout(() => controller.abort(), Api.timeout);

        try {
            const response = await fetch(url, init);
            const result = await response.json();
            if (result.message) throw result;
            return result as T;
        } catch (error: any) {
            if (error.name === "AbortError" || error.name === "TypeError") {
                throw { message: error.message };
            } else {
                throw error;
            }
        } finally {
            clearTimeout(timer);
        }
    }

    static async get<T = any>(url: string, secure: boolean, controller?: AbortController): Promise<T> {
        return await Api.fetch<T>(url, secure, {}, controller);
    }

    static async post<T = any>(
        url: string,
        secure: boolean,
        data?: any,
        controller?: AbortController
    ): Promise<T> {
        console.log('🌐 [API POST]', url);
        console.log('📦 [API POST] Body:', data);
        const result = await Api.fetch<T>(
            url,
            secure,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(data),
            },
            controller
        );
        console.log('✅ [API POST] Response:', result);
        return result;
    }

    static async put<T = any>(
        url: string,
        secure: boolean,
        data?: any,
        controller?: AbortController
    ): Promise<T> {
        return await Api.fetch<T>(
            url,
            secure,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(data),
            },
            controller
        );
    }

    static async delete<T = any>(url: string, secure: boolean, controller?: AbortController): Promise<T> {
        return await Api.fetch<T>(
            url,
            secure,
            {
                method: "DELETE",
            },
            controller
        );
    }

    static async patch<T = any>(
        url: string,
        secure: boolean,
        data?: any,
        controller?: AbortController
    ): Promise<T> {
        return await Api.fetch<T>(
            url,
            secure,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(data),
            },
            controller
        );
    }
}
