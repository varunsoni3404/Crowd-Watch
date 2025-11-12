// Translation Service using Google Translate API
// This service translates report content to different languages

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyDnN-tXy6tXvXdXk3pXmXnXoXpXqXrXsXt'; // Placeholder - will use free method

// Language codes for Google Translate
const LANGUAGE_CODES = {
  en: 'en',
  hi: 'hi',
  mr: 'mr'
};

// Cache for translations to avoid repeated API calls
const translationCache = new Map();

/**
 * Generate cache key for a translation
 */
const getCacheKey = (text, targetLang, sourceLang = 'en') => {
  return `${text}|${sourceLang}|${targetLang}`;
};

/**
 * Detect the language of a text
 * Uses a simple heuristic approach for Hindi and Marathi detection
 */
const detectLanguage = (text) => {
  if (!text || text.trim() === '') return 'en';

  // Devanagari script ranges
  const devanagariRegex = /[\u0900-\u097F]/g;
  const devanagariChars = (text.match(devanagariRegex) || []).length;
  
  // If more than 30% of text is Devanagari, it's likely Hindi or Marathi
  if (devanagariChars > text.length * 0.3) {
    // Try to differentiate between Hindi and Marathi
    // Both use Devanagari, so we'll treat them similarly for now
    // In a production app, you might use a language detection API
    return 'hi'; // Default to Hindi for Devanagari script
  }

  // English detection (basic Latin characters)
  return 'en';
};

/**
 * Translate text using MyMemory Translation API (free, no key needed)
 * This is a free alternative to Google Translate
 */
export const translateText = async (text, targetLanguage, sourceLanguage = null) => {
  if (!text || text.trim() === '') return text;
  
  // If no source language provided, try to detect it
  let sourceLang = sourceLanguage;
  if (!sourceLang) {
    sourceLang = detectLanguage(text);
  }

  if (sourceLang === targetLanguage) return text;

  // Check cache first
  const cacheKey = getCacheKey(text, targetLanguage, sourceLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // Using MyMemory free translation API (no API key required)
    const source = LANGUAGE_CODES[sourceLang] || 'en';
    const target = LANGUAGE_CODES[targetLanguage] || 'en';

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.warn('Translation API error:', response.statusText);
      return text; // Return original text if translation fails
    }

    const data = await response.json();

    // Check if translation was successful
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      const translatedText = data.responseData.translatedText;
      // Cache the translation
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    } else {
      console.warn('Translation API returned no data');
      return text; // Return original text
    }
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

/**
 * Translate multiple fields at once
 */
export const translateReportContent = async (report, targetLanguage) => {
  if (!report) return null;

  try {
    // Detect the original language of the report
    const sourceLanguage = detectLanguage(report.title || report.description || '');
    
    // Only translate if target language is different from source
    if (sourceLanguage === targetLanguage) {
      return report; // No translation needed
    }

    const translatedTitle = await translateText(report.title, targetLanguage, sourceLanguage);
    const translatedDescription = await translateText(report.description, targetLanguage, sourceLanguage);
    const translatedComments = report.additionalComments
      ? await translateText(report.additionalComments, targetLanguage, sourceLanguage)
      : null;
    const translatedAdminNotes = report.adminNotes
      ? await translateText(report.adminNotes, targetLanguage, sourceLanguage)
      : null;

    return {
      ...report,
      title: translatedTitle,
      description: translatedDescription,
      additionalComments: translatedComments || report.additionalComments,
      adminNotes: translatedAdminNotes || report.adminNotes,
      _translated: true,
      _sourceLanguage: sourceLanguage,
      _targetLanguage: targetLanguage,
      _originalTitle: report._originalTitle || report.title,
      _originalDescription: report._originalDescription || report.description,
      _originalComments: report._originalComments || report.additionalComments,
      _originalAdminNotes: report._originalAdminNotes || report.adminNotes
    };
  } catch (error) {
    console.error('Error translating report:', error);
    return report; // Return original report on error
  }
};

/**
 * Translate multiple reports
 */
export const translateReports = async (reports, targetLanguage) => {
  if (!Array.isArray(reports)) return reports;

  return Promise.all(
    reports.map(report => translateReportContent(report, targetLanguage))
  );
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * Detect language of text
 */
export const getDetectedLanguage = (text) => {
  return detectLanguage(text);
};

export default {
  translateText,
  translateReportContent,
  translateReports,
  clearTranslationCache,
  getDetectedLanguage
};
