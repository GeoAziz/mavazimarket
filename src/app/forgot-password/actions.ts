
"use server";

import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail as sendFirebasePasswordResetEmail } from "firebase/auth";
// import { sendPasswordResetEmail as sendCustomPasswordResetEmail } from "@/lib/emailService"; // If using custom emails

interface ForgotPasswordFormValues {
  email: string;
}

export async function sendPasswordResetLinkAction(
  data: ForgotPasswordFormValues
): Promise<{ success: boolean; message: string }> {
  try {
    // Using Firebase's built-in password reset email functionality
    await sendFirebasePasswordResetEmail(auth, data.email);
    
    // If you wanted to use your custom email template via Nodemailer (more complex setup for link generation):
    // const resetLink = `https://your-app-domain.com/reset-password?token=GENERATED_TOKEN`; // Token generation is complex
    // const emailResult = await sendCustomPasswordResetEmail(data.email, resetLink);
    // if (!emailResult.success) {
    //   throw new Error(emailResult.error || "Failed to send custom password reset email.");
    // }

    return { 
      success: true, 
      message: "If an account with this email exists, a password reset link has been sent." 
    };
  } catch (error: any) {
    console.error("Password reset error:", error);
    // Firebase often doesn't throw an error if the email doesn't exist to prevent enumeration attacks.
    // So, we usually return a generic success message.
    // If a specific error needs to be handled (e.g. invalid email format, though Zod should catch this), you can.
    return { 
      success: true, // Still return true to the client for security
      message: "If an account with this email exists, a password reset link has been sent." 
    };
  }
}
