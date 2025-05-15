export type UserSignupInput = {
  username: string;
  email: string;
  avatar:string
  password: string;
 
};

export type UserSignupOutput = {
  readonly _id: string;
  readonly username: string;
  readonly email: string;
   readonly avatar:string
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly accessToken: string;
  readonly refreshToken: string;
};

export type SuccessResponse ={
  status: string;       
  message: string; 
  data?:any     
               
  }
export type userData=Array<{ [key: string]: any }>