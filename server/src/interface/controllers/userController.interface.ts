import { Request } from "express";
import { ControllerResponse } from "./userController.types";
import { CustomRequest } from "../../middlewares/jwt/authMiddleware";

export interface IUserController {
  userSignup(httpRequest: Request): Promise<ControllerResponse>;
  userDetails(httpRequest:CustomRequest):Promise<ControllerResponse>
  createChatroom(httpRequest:CustomRequest):Promise<ControllerResponse>
}
