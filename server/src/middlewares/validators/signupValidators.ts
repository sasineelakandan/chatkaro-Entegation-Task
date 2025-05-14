import { NextFunction, Request, Response } from "express";
import validator from "validator";

export function signupValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { username, email, password } = req.body;

    if (!username) throw new Error("Username is required");
    if (
      !validator.isAlphanumeric(username) ||
      !validator.isLength(username, { min: 3, max: 50 })
    ) {
      throw new Error(
        "Username should be alphanumeric and between 3 and 50 characters long"
      );
    }

    if (!email) throw new Error("Email is required");
    if (!validator.isEmail(email)) throw new Error("Invalid email format");


    if (!password) throw new Error("Password is required");
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
    }

   

    next();
  } catch (e: any) {
    res.status(400).json({
      error: e.message,
    });
  }
}
