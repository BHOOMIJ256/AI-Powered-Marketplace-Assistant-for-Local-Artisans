interface SMSConfig {
  provider: 'twilio' | 'fast2sms' | 'console';
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  fast2sms?: {
    apiKey: string;
    senderId: string;
  };
}

// Configuration - you can set these in your .env file
const smsConfig: SMSConfig = {
  provider: process.env.SMS_PROVIDER as 'twilio' | 'fast2sms' | 'console' || 'console',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || '',
  },
  fast2sms: {
    apiKey: process.env.FAST2SMS_API_KEY || '',
    senderId: process.env.FAST2SMS_SENDER_ID || 'ARTISAN',
  },
};

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    // Clean phone number (remove +91, spaces, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '');
    
    if (cleanPhone.length !== 10) {
      console.error(`[SMS] Invalid phone number: ${phone}`);
      return false;
    }

    switch (smsConfig.provider) {
      case 'twilio':
        return await sendViaTwilio(cleanPhone, message);
      case 'fast2sms':
        return await sendViaFast2SMS(cleanPhone, message);
      case 'console':
      default:
        console.log(`[SMS] to ${phone}: ${message}`);
        return true;
    }
  } catch (error) {
    console.error('[SMS] Error sending SMS:', error);
    return false;
  }
}

async function sendViaTwilio(phone: string, message: string): Promise<boolean> {
  try {
    if (!smsConfig.twilio?.accountSid || !smsConfig.twilio?.authToken || !smsConfig.twilio?.fromNumber) {
      console.error('[SMS] Twilio credentials not configured');
      return false;
    }

    // For Twilio, we need to add +91 prefix for Indian numbers
    const formattedPhone = `+91${phone}`;
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${smsConfig.twilio.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${smsConfig.twilio.accountSid}:${smsConfig.twilio.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: smsConfig.twilio.fromNumber,
        Body: message,
      }),
    });

    if (response.ok) {
      console.log(`[SMS] Twilio SMS sent successfully to ${phone}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`[SMS] Twilio SMS failed:`, error);
      return false;
    }
  } catch (error) {
    console.error('[SMS] Twilio error:', error);
    return false;
  }
}

async function sendViaFast2SMS(phone: string, message: string): Promise<boolean> {
  try {
    if (!smsConfig.fast2sms?.apiKey) {
      console.error('[SMS] Fast2SMS API key not configured');
      return false;
    }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': smsConfig.fast2sms.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'v3', // Transactional SMS
        'sender_id': smsConfig.fast2sms.senderId,
        message: message,
        language: 'english',
        flash: 0,
        numbers: phone,
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.status === 'OK') {
      console.log(`[SMS] Fast2SMS sent successfully to ${phone}`);
      return true;
    } else {
      console.error(`[SMS] Fast2SMS failed:`, result);
      return false;
    }
  } catch (error) {
    console.error('[SMS] Fast2SMS error:', error);
    return false;
  }
}

// Helper function to send order notification SMS
export async function sendOrderNotification(artisanPhone: string, orderId: string, totalAmount: number, buyerLocation?: string): Promise<boolean> {
  const message = `🛍️ New Order Alert! 
Order #${orderId} 
Amount: ₹${(totalAmount / 100).toFixed(2)}
${buyerLocation ? `Location: ${buyerLocation}` : ''}
Check your dashboard for details!`;

  return await sendSMS(artisanPhone, message);
}

// Helper function to send order completion SMS to buyer
export async function sendOrderCompletionSMS(buyerPhone: string, orderId: string): Promise<boolean> {
  const message = `✅ Your order #${orderId} has been completed! 
Thank you for shopping with local artisans. 
Rate your experience on our platform!`;

  return await sendSMS(buyerPhone, message);
}
