import { Request, Response } from "express";
import {
  loginUser,
  signupUser,
  verifySignupOtp,
  resendSignupOtp,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
  getCurrentUserById,
} from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";

export async function signup(req: Request, res: Response) {
  const result = await signupUser(req.body);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function verifySignupOtpController(req: Request, res: Response) {
  const { email, otp } = req.body;
  const result = await verifySignupOtp(email, otp);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function resendSignupOtpController(req: Request, res: Response) {
  const { email } = req.body;
  const result = await resendSignupOtp(email);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await loginUser(email, password);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function requestForgotPasswordOtpController(req: Request, res: Response) {
  const { email } = req.body;
  const result = await requestForgotPasswordOtp(email);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function verifyForgotPasswordOtpController(req: Request, res: Response) {
  const { email, otp } = req.body;
  const result = await verifyForgotPasswordOtp(email, otp);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function resetPasswordWithOtpController(req: Request, res: Response) {
  const { email, otp, newPassword } = req.body;
  const result = await resetPasswordWithOtp(email, otp, newPassword);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await getCurrentUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
}
