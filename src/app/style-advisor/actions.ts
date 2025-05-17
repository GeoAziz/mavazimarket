// src/app/style-advisor/actions.ts
"use server";

import { styleAdvisor, type StyleAdvisorInput } from '@/ai/flows/style-advisor';

export async function getStyleAdviceAction(input: StyleAdvisorInput): Promise<{ success: boolean; recommendations?: string; error?: string }> {
  try {
    console.log("Calling AI Style Advisor with input:", input);
    const result = await styleAdvisor(input);
    console.log("AI Style Advisor result:", result);
    return { success: true, recommendations: result.recommendations };
  } catch (error) {
    console.error("Error getting style advice:", error);
    // It's better to return a generic error message to the client
    // and log the specific error on the server.
    let errorMessage = "Failed to get style advice due to an unexpected error.";
    if (error instanceof Error) {
        // If you want to expose more specific errors, you can check error.message
        // but be careful about leaking sensitive information.
        // For now, let's keep it generic for client, but log specific on server.
        console.error("Specific error:", error.message);
    }
    return { success: false, error: errorMessage };
  }
}
