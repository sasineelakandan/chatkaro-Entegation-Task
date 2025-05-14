export type AddUserInput = {
  username: string;
  email: string;
  
  password: string;
 
};

export type AddUserOuput = {
  readonly _id: string;
  readonly username: string;
  readonly email: string;
  
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type GetUserOutput = {
  readonly _id: string;
  readonly username: string;
  readonly email: string;
  
  readonly password: string;
  
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
