import { IUserRepository } from "../interface/repositories/userRepository.interface";
import {
  AddUserInput,
  AddUserOuput,
  GetUserOutput,
  SuccessResponse,
} from "../interface/repositories/userRepository.types";
import { userData } from "../interface/services/userService.types";
import ChatRoom from "../models/Chatroom";
import User from "../models/User";

export class UserRepository implements IUserRepository {
  addUser = async (userData: AddUserInput): Promise<AddUserOuput> => {
    try {
      const user = await User.create({
        ...userData,
        
      });

      return {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatar:user.avatar||'',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0]; 
        const value = error.keyValue[field]; 
        error.message = `${field} '${value}' already exists.`;
      }
      throw new Error(error.message);
    }
  };
  getUserByEmail = async (email: string): Promise<GetUserOutput> => {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      return {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatar:user.avatar||'',
        password: user.password,
      
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error: any) {
      console.error("Error getting user by email:", error);

      throw new Error(error.message);
    }
  };
  userDetails = async (user: string): Promise<userData | null> => {
    try {
      if (!user) {
        
        return null;
      }
  
      
      const users = await User.find();
  
      if (!users || users.length === 0) {
        return null
        
      }
  
      
      return users;
  
    } catch (error: any) {
      
      console.error("Error finding users:", error.message);
    
      return null
    }
  };
  createChatroom=async(user: string, user1: string): Promise<SuccessResponse>=> {
    try {
      if (!user || !user1) {
        return {
          status: 'error',
          message: 'Both user IDs must be provided.',
        };
      }
  
      if (user === user1) {
        return {
          status: 'error',
          message: 'Cannot create a chat room with the same user.',
        };
      }
  
      const users = await User.find({ _id: { $in: [user, user1] } });
  
      if (users.length !== 2) {
        return {
          status: 'error',
          message: 'One or both users not found.',
        };
      }
  
      const existingChatRoom = await ChatRoom.findOne({
        participants: { $all: [user, user1], $size: 2 },
      });
  
      if (existingChatRoom) {
        return {
          status: 'success',
          message: 'Chat room already exists.',
          data: existingChatRoom,
        };
      }
  
      const newChatRoom = new ChatRoom({
        participants: [user, user1],
      });
  
      await newChatRoom.save();
  
      return {
        status: 'success',
        message: 'Chat room created successfully.',
        data: newChatRoom,
      };
  
    } catch (error: any) {
      console.error("Error creating chat room:", error.message);
      return {
        status: 'error',
        message: error.message,
      };
    }
}
}
