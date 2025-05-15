import { Request } from "express";
import { IUserController } from "../interface/controllers/userController.interface";
import { ControllerResponse } from "../interface/controllers/userController.types";
import { IUserService } from "../interface/services/userService.interface";
import { CustomRequest } from "../middlewares/jwt/authMiddleware";

export class UserController implements IUserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

   userSignup = async (httpRequest: Request): Promise<ControllerResponse> => {
    try {
      const file = httpRequest.file as Express.Multer.File;
      const filePath = file?.path;
      console.log(httpRequest)
      const { username, email, password } = httpRequest.body;
  
      console.log(`Signing up user: ${username}, Email: ${email}, File Path: ${filePath}`);
  
      const user = await this.userService.userSignup({
        username,
        email,
        password,
        avatar: filePath, 
      });
  
      const { accessToken, refreshToken } = user;
  
      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 201,
        body: user,
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      console.error("Signup error:", e);
  
      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: e.statusCode || 500,
        body: {
          error: e.message || "Something went wrong during user signup.",
        },
      };
    }
  };
 
  userLogin = async (httpRequest: Request): Promise<ControllerResponse> => {
    try {
      const { email, password } = httpRequest.body;

      const user = await this.userService.userLogin(email, password);
      const { accessToken, refreshToken } = user;

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        body: user,
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      console.log(e);
      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: e.statusCode || 500,
        body: {
          error: e.message,
        },
      };
    }
  };
  userDetails=async(httpRequest:CustomRequest): Promise<ControllerResponse>=> {
    try{
        
       const user=httpRequest?.user?.id
       
     if (!user) {
         return {
             headers: {
                 "Content-Type": "application/json",
             },
             statusCode: 401,
             body: {
                 error: "Invalid email or password",
             },
         };
     }

     const users=await this.userService.userDetails(user)

     
     return {
         headers: {
             "Content-Type": "application/json",
         },
         statusCode: 200,
         body: users
     };
    } catch (e: any) {
     console.error("Error in adminLogin:", e);

     return {
         headers: {
             "Content-Type": "application/json",
         },
         statusCode: e.statusCode || 500,
         body: {
             error: e.message || "An unexpected error occurred",
         },
     };
 }
 
}
createChatroom=async(httpRequest: CustomRequest): Promise<ControllerResponse>=> {
  try{
        
    const user=httpRequest?.user?.id
    const {user1}=httpRequest.body
    
  if (!user) {
      return {
          headers: {
              "Content-Type": "application/json",
          },
          statusCode: 401,
          body: {
              error: "Invalid data",
          },
      };
  }

  const response=await this.userService.createChatroom(user,user1)

  
  return {
      headers: {
          "Content-Type": "application/json",
      },
      statusCode: 200,
      body: response
  };
 } catch (e: any) {
  console.error("Error in adminLogin:", e);

  return {
      headers: {
          "Content-Type": "application/json",
      },
      statusCode: e.statusCode || 500,
      body: {
          error: e.message || "An unexpected error occurred",
      },
  };
}
}
sendMessage=async(httpRequest:CustomRequest): Promise<ControllerResponse> =>{
  try {
    
    const userId = httpRequest?.user?.id;
    const message= httpRequest?.body;
    
    
  
    if (!userId) {
      console.error('User ID not found in the request.');
      throw new Error('Doctor ID is required to update the profile.');
    }
  
    const createmessage = await this.userService.sendMessage(message.chatRoom, message);
  
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201, 
      body: { message: "Msg send  successfully.", data: createmessage.data },
    };
  } catch (error: any) {
    console.error('Error in updateProfilePic:', error.message);
  
    const statusCode = error.message.includes('required') ? 400 : 500; 
  
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode,
      body: { error: error.message || 'An unknown error occurred.' },
    };
  }
}

getMessages = async (httpRequest: CustomRequest): Promise<ControllerResponse> => {
  try {

    const roomId = httpRequest?.query?.roomId;

    
    if (!roomId || typeof roomId !== 'string') {
      console.error('Invalid room ID');
      throw new Error('Room ID is required and must be a string.');
    }

    
    const messages = await this.userService.getMessage(roomId);
   
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200, 
      body: messages, 
    };
  } catch (error: any) {
    console.error('Error in getMessages:', error.message);

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 500, // Internal Server Error
      body: { error: error.message || 'An unknown error occurred.' },
    };
  }
};
mediaFiles=async(httpRequest:CustomRequest): Promise<ControllerResponse>=>{
  try {
    const file = httpRequest.file as Express.Multer.File;
      const filePath = file?.path
    const userId = httpRequest?.user?.id;
    const message= httpRequest?.body;
    
    message.content=filePath
    console.log(message)
    if (!userId) {
      console.error('User ID not found in the request.');
      throw new Error('Doctor ID is required to update the profile.');
    }
  
    const createmessage = await this.userService.sendMessage(message.chatRoom, message);
  
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201, 
      body: { message: "Msg send  successfully.", data: 'createmessage.data'},
    };
  } catch (error: any) {
    console.error('Error in updateProfilePic:', error.message);
  
    const statusCode = error.message.includes('required') ? 400 : 500; 
  
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode,
      body: { error: error.message || 'An unknown error occurred.' },
    };
  }
}

}
