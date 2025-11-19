import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "test@example.com";

    const result = await sendEmail({
      to: email,
      subject: "🧪 Test Email - Vault AI Budget Alert",
      react: EmailTemplate({
        userName: "Test User",
        type: "budget-alert",
        data: {
          percentageUsed: 85,
          budgetAmount: 5000,
          totalExpenses: 4250,
          accountName: "Test Account",
        },
      }),
    });

    if (result.success) {
      return Response.json({
        success: true,
        message: "✅ Test email sent successfully!",
        data: result.data,
      });
    } else {
      return Response.json(
        {
          success: false,
          error: result.error,
          hint: "Make sure RESEND_API_KEY and RESEND_FROM_EMAIL are set in .env",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
