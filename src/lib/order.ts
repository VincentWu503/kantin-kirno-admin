import { ENV } from "@/config/env";
import { fetchWrapper } from "@/utils/fetchWrapper";

export async function getOrders(accessToken: string) {
  try {
    const result = await fetchWrapper(`/order`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  } catch (err) {
    throw err;
  }
}
