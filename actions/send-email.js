import { Resend } from "resend";

export async function sendEmail({ to, subject, react}) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!process.env.RESEND_API_KEY) {
        console.error("❌ RESEND_API_KEY is not set in environment variables");
        return { success: false, error: "Email API key missing" };
    }

    try {
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to,
            subject,
            react,
        });

        console.log("✅ Email sent successfully:", data);
        return { success: true, data };
    } catch (error) {
        console.error("❌ Failed to send Email:", error);
        return { success: false, error: error.message || error };
    }
}