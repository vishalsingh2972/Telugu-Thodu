import { Twilio } from 'twilio';

// Initialize Twilio using your existing backend environment credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const client = new Twilio(accountSid, authToken);

/**
 * sendNriWhatsAppAlert
 * Dispatches a conditional status update or critical escalation message 
 * to the NRI family member in the US via WhatsApp.
 */
export async function sendNriWhatsAppAlert(
  nriPhoneNumber: string,
  overallMood: 'GOOD' | 'NEUTRAL' | 'CONCERNED',
  narrativeSummary: string
): Promise<boolean> {
  try {
    console.log(`Initiating conditional WhatsApp dispatch engine for: ${nriPhoneNumber}`);

    // Constructing the notification copy based on Gemini's clinical evaluation mood
    let messageBody = '';

    if (overallMood === 'CONCERNED') {
      messageBody = `🚨 *PARENT HEALTH ALERT* 🚨\n\nYour parent's health check-in has flagged a potential issue.\n\n*Status:* CONCERNED\n*Summary:* ${narrativeSummary}\n\n👉 *Action Recommended:* Please call back your parents to check in as soon as possible.`;
    } else {
      messageBody = `✅ *Parent Health Check-In Complete* ✅\n\nEverything is going well with your parents today!\n\n*Status:* ${overallMood}\n*Summary:* ${narrativeSummary}\n\nNo immediate action is required.`;
    }

    // Twilio WhatsApp messaging requires prefixes for both numbers
    const response = await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio's standard shared WhatsApp sandbox number
      to: `whatsapp:${nriPhoneNumber}`,
      body: messageBody
    });

    console.log(`[WhatsApp Hub Success] Message routed cleanly. Sid: ${response.sid}`);
    return true;

  } catch (error) {
    console.error("Failed to transmit outbound WhatsApp alert payload via Twilio Hub:", error);
    return false;
  }
}