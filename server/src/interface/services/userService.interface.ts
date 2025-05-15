import { SuccessResponse, userData, UserSignupInput, UserSignupOutput } from "./userService.types";

export interface IUserService {
  userSignup(userData: UserSignupInput): Promise<UserSignupOutput>;
  userDetails(user:string):Promise<userData|null>
  userLogin(email: string, password: string): Promise<UserSignupOutput>;
  createChatroom(user:string,user1:string):Promise<SuccessResponse>;
  sendMessage(roomId:string,message:string):Promise<SuccessResponse>
  // uploadFiles(roomId:string,message:string):Promise<SuccessResponse>
  getMessage(roomId:string):Promise<any>
}
