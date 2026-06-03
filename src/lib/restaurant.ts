import { fetchWrapper } from "@/utils/fetchWrapper";
import { ResponseObject } from "@/utils/interfaces";

export async function getRestaurantStatus(): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/restaurant/status`);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function updateRestaurantStatus(status: string, accessToken: string): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper(`/restaurant/status/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });
    return result;
  } catch (err) {
    throw err;
  }
}
