import { ENV } from "@/config/env";
import { fetchWrapper } from "@/utils/fetchWrapper";

export async function refreshAccessToken(accessToken: string) {
    try {
        const result = await fetchWrapper(`/auth/admin/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return result
    } catch (err) {
        throw err;
    }
}

export async function fetchUser(accessToken: string) {
    try {
        const result = await fetchWrapper('/auth/admin/profile', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
        });

        return result;
  } catch (err) {
    throw err;
  }
}

export async function authMe(accessToken: string) {
    try {
        const result = await fetchWrapper(`/auth/admin/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        return result;
    } catch (err) {
        throw err;
    }
}

export async function handleLogoutApi(accessToken: string) {
    try {
        const result = await fetchWrapper(`/auth/admin/logout`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        return result;
    } catch (err) {
        throw err;
    }
}
