import { Router } from "express";
import {
  login,
  me,
  signup,
  verifySignupOtpController,
  resendSignupOtpController,
  requestForgotPasswordOtpController,
  verifyForgotPasswordOtpController,
  resetPasswordWithOtpController,
} from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", signup);
router.post("/signup/verify-otp", verifySignupOtpController);
router.post("/signup/resend-otp", resendSignupOtpController);

router.post("/login", login);

router.post("/forgot-password/request-otp", requestForgotPasswordOtpController);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtpController);
router.post("/forgot-password/reset", resetPasswordWithOtpController);

router.get("/me", requireAuth, me);

export default router;
