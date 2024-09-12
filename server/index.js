import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); // Make sure this line is present

import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import {register} from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from './middleware/auth.js';
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register); //This route handles the user registration process. register func is in contoller/auth.js -> authorizes, This middleware ensures that the request is authenticated, checking the validity of the JWT token before proceeding.
app.post("/posts", verifyToken, upload.single("picture"), createPost); //This route handles creating new posts. verifyToken is in Middleware folder auth.js, createPost func is in controllers/posts.js

/* ROUTES */
app.use("/auth", authRoutes);  //Path Prefixing -> It tells Express, "For any routes defined in postRoutes, they should start with /posts."
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */ //a diff doc for mongoose pls

const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    User.insertMany(users);
    Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));