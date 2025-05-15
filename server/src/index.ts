import express from "express";

import userRouter from "../src/routes/userRoutes";
import { FRONTEND_URL, PORT } from "./utils/constants";

import { connectDb } from "./config/database";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketHandler, setIO } from './utils/socket';

const app = express();

connectDb();

const httpServer = createServer(app);


export const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL() || '*', 
    methods: ['GET', 'POST'], 
  },
});
setIO(io); 
socketHandler(io);

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    callback(null, true);  
  },
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api/user',userRouter)



httpServer.listen(PORT, () => console.log(`Server started running on port ${PORT}`));