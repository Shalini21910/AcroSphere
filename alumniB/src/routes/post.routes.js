import express from "express";
import{
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,

    addComment,
    toggleLike,
    getComments,
}from "../controllers/post.controller.js";
import {protect} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router=express.Router();

router.route("/")
.get(getAllPosts) //anyone can view
.post(protect,upload.single("image"),createPost); //only logged in users can create

router.route("/:id")
.get(getPostById)
.put(protect,updatePost)
.delete(protect,deletePost);

//new routes for comments and likes
router.route("/:id/comments")
.post(protect,addComment)
.get(getComments);

router.route("/:id/like")
.put(protect,toggleLike);

export default router;