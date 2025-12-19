import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadImage=async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"});
        }

        const streamUpload=(fileBuffer)=>{
            return new Promise((resolve,reject)=>{
                const stream=cloudinary.uploader.upload_stream(
                    {folder:"alumni_uploads"},
                    (error,result)=>{
                        if(result)resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result=await streamUpload(req.file.buffer);
        res.json({imageUrl:result.secure_url});
    
    }catch(error){
        console.error("Upload failed:",error);
        res.status(500).json({message:"upload failed",error:error.message});
    }
};