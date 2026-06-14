import { fetchWrapper } from "@/utils/fetchWrapper";
import { ResponseObject } from "@/utils/interfaces";

export async function getRestaurantStatus(): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper('/restaurant/status');
    return result;
  } catch (err) {
    throw err;
  }
}

export async function updateRestaurantStatus(status: string, accessToken: string): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper('/restaurant/status/', {
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

export async function getRestaurantData(): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper('/restaurant');
    return result;
  } catch (err) {
    throw err;
  }
}

export async function updateRestaurantData(data: any, accessToken: string): Promise<ResponseObject> {
  try {
    const result = await fetchWrapper('/restaurant/', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    return result;
  } catch (err) {
    throw err;
  }
}
