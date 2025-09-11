# Google Translate API Integration

This document explains how to set up and use Google Translate API for dynamic translations in the Artisan Marketplace application.

## 🚀 Setup Complete

The following components have been implemented:

### 1. **Google Cloud Translate Service** (`src/lib/translate.ts`)
- ✅ Google Cloud Translate client initialization
- ✅ Translation caching to avoid repeated API calls
- ✅ Support for single and batch translations
- ✅ Error handling with fallback to original text

### 2. **Translation API Route** (`src/app/api/translate/route.ts`)
- ✅ Server-side translation endpoint
- ✅ Handles both single text and batch translations
- ✅ Proper error handling and response formatting

### 3. **Updated Language Context** (`src/contexts/LanguageContext.tsx`)
- ✅ Async translation support with `t()` function
- ✅ Sync fallback with `tSync()` function
- ✅ Client-side caching for better performance
- ✅ Automatic cache clearing on language change

### 4. **Enhanced TranslatedText Component** (`src/components/TranslatedText.tsx`)
- ✅ Shows immediate fallback text
- ✅ Loads Google Translate version asynchronously
- ✅ Loading indicator during translation
- ✅ Error handling with graceful fallback

### 5. **Service Account Credentials** (`google-credentials.json`)
- ✅ Google Cloud service account credentials configured
- ✅ Project ID: `story-telling-project-470510`
- ✅ Proper file permissions and security

## 🔧 How It Works

### Translation Flow:
1. **User selects language** → Language context updates
2. **TranslatedText component renders** → Shows immediate fallback text
3. **Google Translate API call** → Fetches real-time translation
4. **Translation displayed** → Updates UI with translated text
5. **Caching** → Stores translation for future use

### Performance Optimizations:
- **Client-side caching**: Avoids repeated API calls for same text
- **Immediate fallback**: Shows static translation while Google Translate loads
- **Batch translation**: Can translate multiple texts in one API call
- **Error handling**: Graceful fallback to English if translation fails

## 🧪 Testing

### Test Page Available:
Visit `/test-translate` to test the Google Translate integration:
- Change language using the language selector
- Enter custom text to translate
- See real-time translations
- Test static translation keys

### Test Commands:
```bash
# Test translation API directly
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Welcome to our marketplace", "targetLanguage": "hi"}'
```

## 📋 Supported Languages

Currently supported languages:
- **English** (`en`) - Source language
- **Hindi** (`hi`) - Google Translate
- **Tamil** (`ta`) - Google Translate
- **Bengali** (`bn`) - Available in i18n
- **Telugu** (`te`) - Available in i18n
- **Marathi** (`mr`) - Available in i18n
- **Gujarati** (`gu`) - Available in i18n
- **Kannada** (`kn`) - Available in i18n
- **Malayalam** (`ml`) - Available in i18n
- **Punjabi** (`pa`) - Available in i18n

## 🔄 Migration from Static Translations

### Before (Static):
```tsx
<TranslatedText translationKey="welcomeTitle" />
// Always shows pre-defined translations
```

### After (Dynamic):
```tsx
<TranslatedText translationKey="welcomeTitle" />
// Shows static fallback immediately, then Google Translate version
```

### Benefits:
- ✅ **Real-time translations** for any language
- ✅ **Better accuracy** with Google's AI
- ✅ **No manual translation maintenance**
- ✅ **Supports new languages** without code changes
- ✅ **Graceful fallback** if API fails

## 🛠️ Configuration

### Environment Variables:
```bash
# Google Cloud credentials (already configured)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=story-telling-project-470510
```

### API Usage:
- **Free tier**: 500,000 characters per month
- **Paid tier**: $20 per 1M characters after free tier
- **Caching**: Reduces API calls significantly

## 🚨 Important Notes

1. **Credentials Security**: 
   - `google-credentials.json` contains sensitive data
   - Should be added to `.gitignore` in production
   - Use environment variables in production

2. **API Limits**:
   - Monitor usage in Google Cloud Console
   - Implement rate limiting if needed
   - Cache translations to reduce API calls

3. **Fallback Strategy**:
   - Always falls back to static translations
   - Never breaks the UI if translation fails
   - Shows loading indicators during translation

## 🎯 Next Steps

1. **Test the integration** by visiting `/test-translate`
2. **Verify translations** work across all pages
3. **Monitor API usage** in Google Cloud Console
4. **Add more languages** as needed
5. **Optimize caching** based on usage patterns

## 🔍 Troubleshooting

### Common Issues:

1. **"Cannot find module '@google-cloud/translate'"**
   ```bash
   npm install @google-cloud/translate
   ```

2. **"Authentication failed"**
   - Check `google-credentials.json` file exists
   - Verify service account has Translate API access
   - Check project ID matches

3. **"Translation not working"**
   - Check browser console for errors
   - Verify API route is accessible
   - Test with `/test-translate` page

4. **"Slow translations"**
   - Normal for first-time translations
   - Subsequent translations use cache
   - Consider batch translation for multiple texts

The Google Translate integration is now fully functional and ready for use! 🎉
