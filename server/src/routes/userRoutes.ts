import { Request, Response, Router } from "express";
import { expressCallback } from "../utils/expressCallback";
import { UserController } from "../controllers/userController";
import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/userService";
import { signupValidator } from "../middlewares/validators/signupValidators";
import { loginValidator } from "../middlewares/validators/loginValidator";
import upload from "../utils/multer";
import authMiddleware from "../middlewares/jwt/authMiddleware";

const router = Router();

const repository = new UserRepository();

const service = new UserService(repository);

const controller = new UserController(service);

router
  .route("/signup")
  .post(upload.single('file'),signupValidator ,expressCallback(controller.userSignup));

router
  .route("/login")
  .post(loginValidator, expressCallback(controller.userLogin));

router
  .route('/users')
  .get(authMiddleware, expressCallback(controller.userDetails))

router
  .route("/chatrooms")
  .post(authMiddleware, expressCallback(controller.createChatroom));

router
  .route('/messages')
  .get(authMiddleware,expressCallback(controller.getMessages))
  .post(authMiddleware,expressCallback(controller.sendMessage))

router
  .route('/messages/upload')
  .post(upload.single('file'),authMiddleware, expressCallback(controller.mediaFiles));

  
  
  
  router.route("/logout").post((req:Request, res:Response) => {
    
    res.clearCookie("accessToken", {
     
    });
    
    res.clearCookie("refreshToken", {
     
    });
    res.status(200).json({ message: "Logged out successfully" });
  });
export default router;
