import express from "express";
import {uploadImage} from "../controllers/upload.controller.js";
import upload from "../middlewares/upload.middleware.js";
import {protect} from "../middlewares/auth.middleware.js";

const router=express.Router();

//post /api/upload
router.post("/",protect,upload.single("image"),uploadImage);

export default router;