import { fetchWrapper } from "@/utils/fetchWrapper";
import { ResponseObject } from "@/utils/interfaces";

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

export async function updateOrderStatus(
  orderId: number,
  status: string,
  accessToken: string,
): Promise<ResponseObject> {
  return fetchWrapper(`/order/${orderId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status }),
  });
}
