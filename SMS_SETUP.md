# 📱 SMS Setup Guide for Local Artisans Marketplace

## 🎯 **What's Now Available:**

✅ **Real SMS functionality** - No more console-only logs!  
✅ **Multiple SMS providers** - Choose what works best for you  
✅ **Order notifications** - Artisans get SMS when orders are placed  
✅ **Completion notifications** - Buyers get SMS when orders are completed  
✅ **Error handling** - SMS failures won't break your app  

---

## 🚀 **Quick Start (Testing Mode):**

1. **No setup required** - SMS will log to console by default
2. **Test the flow** - Place orders and see console logs
3. **Verify functionality** - Check that SMS calls are working

---

## 🔧 **Production SMS Setup:**

### **Option 1: Twilio (Recommended - International, Reliable)**

1. **Sign up** at [twilio.com](https://twilio.com)
2. **Get credentials** from your Twilio Console:
   - Account SID
   - Auth Token  
   - Phone number for sending SMS
3. **Add to your `.env` file:**
   ```bash
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_FROM_NUMBER=+1234567890
   ```

### **Option 2: Fast2SMS (India-focused, Free tier)**

1. **Sign up** at [fast2sms.com](https://fast2sms.com)
2. **Get API key** from your dashboard
3. **Add to your `.env` file:**
   ```bash
   SMS_PROVIDER=fast2sms
   FAST2SMS_API_KEY=your_api_key
   FAST2SMS_SENDER_ID=ARTISAN
   ```

---

## 📋 **SMS Messages Sent:**

### **When Customer Places Order → Artisan Gets:**
```
🛍️ New Order Alert! 
Order #123 
Amount: ₹500.00
Location: Mumbai, Maharashtra
Check your dashboard for details!
```

### **When Order Completed → Buyer Gets:**
```
✅ Your order #123 has been completed! 
Thank you for shopping with local artisans. 
Rate your experience on our platform!
```

---

## 🧪 **Testing SMS:**

### **Test Mode (Console):**
```bash
SMS_PROVIDER=console
```
- SMS logs to console only
- Perfect for development/testing
- No external dependencies

### **Test with Real Provider:**
1. Set up Twilio or Fast2SMS
2. Add test phone numbers to your database
3. Place test orders
4. Check SMS delivery

---

## 🔍 **Troubleshooting:**

### **SMS Not Sending:**
1. Check environment variables are set correctly
2. Verify phone numbers are in correct format (10 digits for India)
3. Check provider credentials are valid
4. Look at console logs for error details

### **Phone Number Issues:**
- **Input**: `+91 98765 43210` or `9876543210`
- **Processed**: `9876543210` (10 digits)
- **Twilio**: Automatically adds `+91` prefix
- **Fast2SMS**: Uses 10-digit format

---

## 💰 **Costs:**

### **Twilio:**
- **Free trial**: $15-20 credit
- **Production**: ~$0.0075 per SMS (US/Canada)
- **International**: Varies by country

### **Fast2SMS:**
- **Free tier**: Limited SMS per day
- **Paid plans**: Very affordable for Indian numbers
- **Bulk discounts**: Available for high volume

---

## 🎉 **You're All Set!**

Now when customers place orders:
1. **Order is created** in database
2. **SMS is sent** to artisan's phone
3. **Artisan gets notified** immediately
4. **Dashboard updates** with new order
5. **Location data** is captured for insights

The SMS system is **production-ready** and will scale with your marketplace! 🚀
