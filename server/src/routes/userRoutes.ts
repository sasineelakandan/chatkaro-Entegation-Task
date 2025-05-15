import { Router } from "express";
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

export default router;
