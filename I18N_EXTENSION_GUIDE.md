# i18n Extension Guide

## Adding More Translations

### Step 1: Update Translation Files

Add your new translations to all three language files:

#### `/src/locales/en/common.json`
```json
{
  "newSection": {
    "title": "New Section Title",
    "description": "New description",
    "button": "Click Me"
  }
}
```

#### `/src/locales/hi/common.json`
```json
{
  "newSection": {
    "title": "नई अनुभाग शीर्षक",
    "description": "नई विवरण",
    "button": "मुझे क्लिक करें"
  }
}
```

#### `/src/locales/mr/common.json`
```json
{
  "newSection": {
    "title": "नवीन विभाग शीर्षक",
    "description": "नवीन विवरण",
    "button": "मला क्लिक करा"
  }
}
```

### Step 2: Use in Component

```jsx
import useTranslation from '../hooks/useTranslation';

function MyNewComponent() {
  const { t, direction } = useTranslation();

  return (
    <div dir={direction} className="my-component">
      <h2>{t('newSection.title')}</h2>
      <p>{t('newSection.description')}</p>
      <button>{t('newSection.button')}</button>
    </div>
  );
}

export default MyNewComponent;
```

## Examples

### Example 1: Translating Form Inputs

**Add to JSON files:**
```json
{
  "form": {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "submit": "Submit Form"
  }
}
```

**Use in component:**
```jsx
import useTranslation from '../hooks/useTranslation';

function FormComponent() {
  const { t } = useTranslation();

  return (
    <form>
      <input placeholder={t('form.name')} />
      <input placeholder={t('form.email')} type="email" />
      <input placeholder={t('form.phone')} />
      <button type="submit">{t('form.submit')}</button>
    </form>
  );
}
```

### Example 2: Translating Error Messages

**Add to JSON files:**
```json
{
  "errors": {
    "nameRequired": "Name is required",
    "emailInvalid": "Email is invalid",
    "passwordWeak": "Password must be at least 8 characters"
  }
}
```

**Use in component:**
```jsx
import useTranslation from '../hooks/useTranslation';

function ValidationExample() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState([]);

  const validateForm = (data) => {
    const newErrors = [];
    if (!data.name) newErrors.push(t('errors.nameRequired'));
    if (!isValidEmail(data.email)) newErrors.push(t('errors.emailInvalid'));
    if (data.password.length < 8) newErrors.push(t('errors.passwordWeak'));
    setErrors(newErrors);
  };

  return (
    <div>
      {errors.map((error, i) => (
        <p key={i} className="error">{error}</p>
      ))}
    </div>
  );
}
```

### Example 3: Translating Dynamic Content

**Add to JSON files:**
```json
{
  "report": {
    "statusChanged": "Report status changed to {{status}}",
    "updated": "Last updated: {{date}}",
    "createdBy": "Created by {{author}} on {{date}}"
  }
}
```

**Use in component:**
```jsx
import useTranslation from '../hooks/useTranslation';

function ReportDetail({ report }) {
  const { t } = useTranslation();

  // Simple replacement function
  const interpolate = (template, values) => {
    let result = template;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(`{{${key}}}`, value);
    });
    return result;
  };

  return (
    <div>
      <p>{interpolate(t('report.statusChanged'), { 
        status: report.status 
      })}</p>
      <p>{interpolate(t('report.updated'), { 
        date: new Date(report.updatedAt).toLocaleDateString() 
      })}</p>
    </div>
  );
}
```

## Adding Language Direction Support (RTL)

For future Arabic, Hebrew, or Persian support:

```jsx
// In component
const { t, direction } = useTranslation();

return (
  <div dir={direction} className={direction === 'rtl' ? 'rtl-layout' : ''}>
    {/* Content */}
  </div>
);
```

**CSS for RTL:**
```css
.rtl-layout {
  text-align: right;
  direction: rtl;
}

.rtl-layout button {
  margin-left: auto;
  margin-right: 0;
}
```

## Translation Organization Best Practices

### Logical Grouping
```json
{
  "auth": {},          // Authentication related
  "user": {},          // User features
  "admin": {},         // Admin features
  "common": {},        // Shared UI
  "errors": {},        // Error messages
  "validation": {},    // Form validation
  "messages": {}       // General messages
}
```

### Naming Conventions
- Use lowercase with dots for nesting
- Use camelCase for nested keys
- Be descriptive: `button.submitForm` not `button.btn`
- Group related items: `status.pending`, `status.approved`

### Key Naming Examples
```
✅ Good:
- auth.login
- report.title
- error.emailInvalid
- message.welcome

❌ Avoid:
- loginBtn
- title
- err1
- msg
```

## Adding Language Selector UI

### In Header Component
```jsx
import LanguageSwitcher from '../components/common/LanguageSwitcher';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
```

### Custom Language Selector
```jsx
import useTranslation from '../hooks/useTranslation';

function CustomLanguageSelector() {
  const { language, changeLanguage, availableLanguages } = useTranslation();

  return (
    <div className="language-selector">
      {availableLanguages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={language === lang.code ? 'active' : ''}
          title={lang.name}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
}
```

## Testing Translations

### Manual Testing Checklist
- [ ] Each page displays correctly in all languages
- [ ] Language switching works instantly
- [ ] Selected language persists after page refresh
- [ ] All form labels are translated
- [ ] All buttons are translated
- [ ] All messages are translated
- [ ] No placeholder text in original language appears

### Unit Test Example
```jsx
import { renderHook, act } from '@testing-library/react';
import useTranslation from '../hooks/useTranslation';

describe('useTranslation', () => {
  it('should translate to selected language', () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('auth.login')).toBe('Login');
    
    act(() => {
      result.current.changeLanguage('hi');
    });
    
    expect(result.current.t('auth.login')).toBe('लॉगिन');
  });
});
```

## Common Issues & Solutions

### Issue: Translation key shows instead of text
**Solution:** Check that:
1. Key exists in all language files
2. Spelling matches exactly (case-sensitive)
3. Use correct dot notation: `section.key`

### Issue: Language doesn't persist after refresh
**Solution:** Check browser localStorage and ensure:
1. Private browsing is not enabled
2. localStorage is not disabled
3. Check browser console for errors

### Issue: Some components not translating
**Solution:**
1. Ensure component imports `useTranslation`
2. Call hook at top of component
3. Replace hardcoded strings with `t()` calls
4. Wrap content with `dir={direction}`

## Performance Optimization

### Avoid Re-renders
```jsx
// Instead of calling hook multiple times
const { t } = useTranslation();

// Get all translations upfront
const translations = {
  title: t('report.title'),
  description: t('report.description'),
  button: t('common.submit')
};
```

### Lazy Load for Large Apps
```jsx
// For future consideration with large translation sets
const translations = {
  en: () => import('../locales/en/common.json'),
  hi: () => import('../locales/hi/common.json'),
  mr: () => import('../locales/mr/common.json')
};
```

## Adding More Languages

To add a new language (e.g., Spanish):

1. **Create new translation file:**
   ```
   /src/locales/es/common.json
   ```

2. **Update useTranslation hook:**
   ```jsx
   import enTranslations from '../locales/en/common.json';
   import hiTranslations from '../locales/hi/common.json';
   import mrTranslations from '../locales/mr/common.json';
   import esTranslations from '../locales/es/common.json'; // Add this

   const translations = {
     en: enTranslations,
     hi: hiTranslations,
     mr: mrTranslations,
     es: esTranslations // Add this
   };

   // Update availableLanguages array
   availableLanguages: [
     { code: 'en', name: 'English', nativeName: 'English' },
     { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
     { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
     { code: 'es', name: 'Spanish', nativeName: 'Español' }
   ]
   ```

3. **Update locale direction mapping (if needed):**
   ```jsx
   const rtlLanguages = ['ar', 'he', 'ur']; // Add if Spanish is RTL
   ```

---

## Summary

- 📝 Add translations to all 3 JSON files
- 🎣 Use `useTranslation()` hook in components
- 🔄 Replace hardcoded strings with `t('key.path')`
- ➕ Add `dir={direction}` to containers
- 🧪 Test in all supported languages
- 🚀 Add new languages by following the pattern

For questions or issues, refer to the main translation files in `/src/locales/`
