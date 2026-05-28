import { ENV } from "@/config/env";
import { checkInteger, exists } from "@/utils/checkUtils";
import { MenuData, MenuResponseData } from "@/utils/types";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { apiRoute } from "@/utils/fetchUtils";

interface UpsertMenuData {
    mode: string,
    token: string,
    body: object
}

export async function fetchMenu(offset: number, limit: number, search?: string): Promise<unknown> {
    checkInteger(offset, 0);
    checkInteger(limit, 0);

    let query: string = `?offset=${offset}&limit=${limit}`;
    if (exists(search)) query += `&search=${search}`;
    const res = await fetch(apiRoute(`/menu${query}`)).then(res => res.json()).then(body => body).catch((e) => e);

    return res;
}

export async function upsertMenu(url: string, requiredData: UpsertMenuData) {
    try {
        const {mode, token, body} = requiredData;

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