import { IUserRepository } from "../interface/repositories/userRepository.interface";
import { IUserService } from "../interface/services/userService.interface";
import {
  SuccessResponse,
  userData,
  UserSignupInput,
  UserSignupOutput,
} from "../interface/services/userService.types";

import { comparePassword, encryptPassword } from "../utils/encryption";
import { AppError } from "../utils/errors";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJWT";

export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  userSignup = async (userData: UserSignupInput): Promise<UserSignupOutput> => {
    try {
      const encryptedPassword = encryptPassword(userData.password);

      const user = await this.userRepository.addUser({
        ...userData,
        password: encryptedPassword,
      });

      const accessToken = generateAccessToken(user._id, "user");
      const refreshToken = generateRefreshToken(user._id, "user");

      return { ...user, accessToken, refreshToken };
    } catch (error: any) {
      console.log("Error in user service", error.message);
      throw new Error(error.message);
    }
  };

  userLogin = async (
    email: string,
    password: string
  ): Promise<UserSignupOutput> => {
    try {
      const user = await this.userRepository.getUserByEmail(email);

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) throw new AppError("Invalid Credentials", 401);

      const accessToken = generateAccessToken(user._id, "user");
      const refreshToken = generateRefreshToken(user._id, "user");

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar:user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.log("Error in user service", error.message);
      throw new Error(error.message);
    }
  };
  userDetails = async (user: string): Promise<userData | null> => {
    try {
      if (!user) {
        
        return null;
      }
  
      
      const users = await this.userRepository.userDetails(user);
  
      if (!users) {
        
        return null;
      }
  

      return users;
  
    } catch (error: any) {
      console.log("Error in user service:", error.message);
    
      return null;
    }
  };
  createChatroom=async(user: string, user1: string): Promise<SuccessResponse>=> {
    try {
      if (!user) {
        return {
          status: 'error',
          message: 'User ID is missing',
        };
      }
  
      const chatRoom = await this.userRepository.createChatroom(user, user1);
  
      if (!chatRoom) {
        return {
          status: 'error',
          message: 'Failed to create or fetch chat room',
        };
      }
  
      return {
        status: 'success',
        message: 'Chat room created or fetched successfully',
        data: chatRoom,
      };
  
    } catch (error: any) {
      console.log("Error in user service:", error.message);
      return {
        status: 'error',
        message: 'Internal server error',
      };
    }
}
}
