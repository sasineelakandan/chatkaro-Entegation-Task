import { AddUserInput, AddUserOuput, GetUserOutput, SuccessResponse, userData } from "./userRepository.types";

export interface IUserRepository {
  addUser(userData: AddUserInput): Promise<AddUserOuput>;
  getUserByEmail(email: string) : Promise<GetUserOutput>;
  userDetails(user:string):Promise<userData|null>
  createChatroom(user:string,user1:string):Promise<SuccessResponse>;
}
