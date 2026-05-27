import { v2 as cloudinary } from "cloudinary";
 
// w gk bakal taruh di config, NEEDLESS ABSTRACTION + takut behavior beda karena filenya di client side

 
// implementasi simpel, gak perlu config aneh2 lagi
export async function POST(request: Request) {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,// server side env, so it will never be exposed at client side
    });
    const body = await request.json();
    const { paramsToSign } = body;
    
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET || "");
    
    return Response.json({ signature });
}