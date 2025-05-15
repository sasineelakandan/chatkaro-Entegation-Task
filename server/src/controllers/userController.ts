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
}
