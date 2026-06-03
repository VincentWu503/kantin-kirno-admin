import { checkInteger, exists } from "@/utils/checkUtils";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { ResponseObject } from "@/utils/interfaces";

interface UpsertMenuData {
  mode: string;
  token: string;
  body: object;
}

export async function fetchMenu(
  offset: number,
  limit: number,
  search?: string,
): Promise<ResponseObject> {
  checkInteger(offset, 0);
  checkInteger(limit, 0);

  let query: string = `?offset=${offset}&limit=${limit}`;
  if (exists(search)) query += `&search=${search}`;

  return fetchWrapper(`/menu${query}`);
}

export async function deleteMenu(
  menuId: number,
  accessToken: string,
): Promise<ResponseObject> {
  return fetchWrapper(`/menu/${menuId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function upsertMenu(url: string, requiredData: UpsertMenuData) {
  try {
    const { mode, token, body } = requiredData;

    const response = await fetchWrapper(url, {
      method: mode === "add" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return response;
  } catch (err) {
    throw err;
  }
}
