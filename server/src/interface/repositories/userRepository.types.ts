export type AddUserInput = {
  username: string;
  email: string;
  avatar:string
  password: string;
 
};

export type AddUserOuput = {
  readonly _id: string;
  readonly username: string;
  readonly email: string;
  readonly avatar:string
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type GetUserOutput = {
  readonly _id: string;
  readonly username: string;
  readonly email: string;
  readonly avatar:string
  readonly password: string;
  
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
export type SuccessResponse ={
  status: string;       
  message: string; 
  data?:any     
               
  }

export type userData=Array<{ [key: string]: any }>