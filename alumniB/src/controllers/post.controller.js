import Post from "../models/post.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

//@desc Create a new post
//@route Post/api/posts
//@access Private

export const addComment=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)return res.status(404).json({message:"Post not found"});

        const comment={
            user:req.user._id,
            text:req.body.text,
        };

        post.comments.push(comment);
        await post.save();

        const populatedPost=await Post.findById(req.params.id)
        .populate("comments.user","name email role");

        res.status(201).json(populatedPost.comments);
    }catch(error){
        console.error("Add comment error:",error);
        res.status(500).json({message:"Server error"});
    }
};

//like or unlike a post
export const toggleLike=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)return res.status(404).json({message:"Post not found"});

        const userId=req.user._id;
        const index=post.likes.indexOf(userId);

        if(index===-1){
            post.likes.push(userId); //like
        }else{
            post.likes.splice(index,1);
        }

        await post.save();
        res.json({likes:post.likes.length});
    }catch(error){
        console.error("like toggle error:",error);
        res.status(500).json({message:"server error"});
    }
};

//get comments for a specific post
export const getComments=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id).populate(
            "comments.user",
            "name email role"
        );
        if(!post)return res.status(404).json({message:"Post not found"});
        
        res.json(post.comments);
    }catch(error){
        console.error("Get comments error:",error);
        res.status(500).json({message:"Server error"});
    }
};

export const createPost=async(req,res)=>{
    try{
        const{title, content}=req.body;

        if(!title||!content){
            return res.status(400).json({message:"Title and content are required"});
        }
        
let image=null;
//upload image if attached
if(req.file){
    const streamUpload=()=>{
        return new Promise((resolve, reject)=>{
            const stream=cloudinary.uploader.upload_stream(
                {folder:"alumni_posts"},
                (error, result)=>{
                    if(result)resolve(result);
                    else reject(error);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    const result =await streamUpload();
    image=result.secure_url;
}

        const post=await Post.create({
            user:req.user._id,
            title,
            content,
            image,
        });

        res.status(201).json(post);
    }catch(error){
        console.error("Create Post Error:",error);
        res.status(500).json({message:"Server error"});
    }
};

//@desc get all posts
//@route get/api/posts
//@access public
export const getAllPosts=async(req,res)=>{
    try{
        const posts=await Post.find()
        .populate("user","name email role")
        .sort({createdAt:-1});
    res.json(posts);
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
};

//@desc get single post by id
//@route get/api/posts/:id
//@access public
export const getPostById=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id).populate("user","name email role");
        if (!post)return res.status(404).json({message:"Post not found"});
        res.json(post);
    }catch(error){
        res.status(500).json({message:"server error"});
    }
};

//@desc update a post
//@route put /api/posts/:id
//@access Private (owner only)
export const updatePost=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)return res.status(404).json({message:"post not found"});
        if(post.user.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"not authorized"});
        }
        post.title=req.body.title||post.title;
        post.content=req.body.content||post.content;
        post.image=req.body.image||post.image;

        const updatedPost=await post.save();
        res.json(updatedPost);
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
};

//@desc delete a post
//@route delete /api/posts/:id
//@access Private(owner only)
export const deletePost=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)return res.status(404).json({message:"Post not found"});
        if(post.user.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"not authorized"});
        }
        await post.deleteOne();
        res.json({message:"post removed"});
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
};
