import express from "express";
import cookieParser from "cookie-parser";


import { connectDB } from "./configs/database.config.js";
import { PORT } from "./configs/server.config.js";
import appRoutes from "./routes/index.routes.js"

const startServerSetup = async () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); 
    app.use(cookieParser());


    app.use("/api",appRoutes)


    app.listen(PORT, async () => {
        console.log("Server started ", PORT);
        connectDB();
        console.log("Successfully connected to mongodb");
    });
};

startServerSetup();


