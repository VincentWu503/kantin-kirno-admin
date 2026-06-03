import { fetchWrapper } from "@/utils/fetchWrapper";
import { ResponseObject } from "@/utils/interfaces";

export async function refreshAccessToken(
  accessToken: string,
): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function authMe(accessToken: string): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function handleLogoutApi(
  accessToken: string,
): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function handleLoginApi(
  body: object = {},
): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body }),
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function getAdmins(accessToken: string): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function createAdmin(
  body: { email: string; password: string; confirm_password: string },
  accessToken: string,
): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function updateAdmin(
  adminId: string,
  body: Record<string, string>,
  accessToken: string,
): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/${adminId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    return result;
  } catch (err) {
    throw err;
  }
}

export async function deleteAdmin(
  adminId: string,
  accessToken: string,
): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/auth/admin/${adminId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  } catch (err) {
    throw err;
  }
}
