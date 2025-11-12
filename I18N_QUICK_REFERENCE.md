# Quick Reference: Multilingual Support

## 🚀 Quick Start

### Using Translations in Any Component

```jsx
import useTranslation from '../hooks/useTranslation';

function MyComponent() {
  const { t, direction } = useTranslation();
  
  return (
    <div dir={direction}>
      <h1>{t('section.key')}</h1>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### All Available Translation Keys

```
app.title                    | "Civic Issue Reporting System" | App title
app.tagline                  | "Report and Track..." | App tagline

common.language              | "Language" | Language selector
common.loading               | "Loading..." | Loading text
common.submit                | "Submit" | Submit button
common.logout                | "Logout" | Logout button
common.cancel                | "Cancel" | Cancel button
common.delete                | "Delete" | Delete button
common.download              | "Download" | Download button
(and 10+ more common items)

auth.login                   | "Login" | Login page title
auth.register                | "Register" | Register page title
auth.email                   | "Email Address" | Email field
auth.password                | "Password" | Password field
auth.loginSuccessful         | "Login successful!" | Success message
(and 16+ more auth items)

user.dashboard               | "User Dashboard" | Dashboard title
user.myReports               | "My Reports" | Reports section
user.reportIssue             | "Report an Issue" | Report button

admin.dashboard              | "Admin Dashboard" | Admin title
admin.allReports             | "All Reports" | Reports section
admin.statistics             | "Statistics" | Stats section
(and 9+ more admin items)

report.title                 | "Title" | Report title
report.description           | "Description" | Report description
report.category              | "Category" | Category field
report.location              | "Location" | Location field
report.status                | "Status" | Status field
(and 15+ more report items)

status.pending               | "Pending" | Pending status
status.inProgress            | "In Progress" | In progress status
status.resolved              | "Resolved" | Resolved status

categories.potholes          | "Potholes" | Category name
categories.sanitation        | "Sanitation" | Category name
categories.streetlights      | "Street Lights" | Category name
categories.waterSupply       | "Water Supply" | Category name
categories.drainage          | "Drainage" | Category name
categories.traffic           | "Traffic" | Category name
categories.parks             | "Parks" | Category name
categories.other             | "Other" | Category name

messages.welcome             | "Welcome" | Welcome message
messages.actionSuccessful    | "Action completed..." | Success message
(and 8+ more messages)

validation.emailInvalid      | "Please enter a valid email" | Validation
validation.passwordTooShort  | "Password must be..." | Validation
```

## 🌍 Supported Languages

| Code | Name | Native Name |
|------|------|-------------|
| en | English | English |
| hi | Hindi | हिंदी |
| mr | Marathi | मराठी |

## 📍 Where Language Selector Appears

- Login page (top-right)
- Register page (top-right)
- User Dashboard (top-right)
- Admin Dashboard (top-right)
- Report Form (top-right)

## 🔧 Hook API

```jsx
const {
  t,                    // Function: t(key) -> translation string
  language,             // String: current language code ('en', 'hi', 'mr')
  changeLanguage,       // Function: changeLanguage(code) -> void
  direction,            // String: text direction ('ltr' or 'rtl')
  availableLanguages    // Array: list of available languages
} = useTranslation();
```

## 📝 Common Usage Patterns

### Simple Translation
```jsx
<h1>{t('auth.login')}</h1>
```

### Button with Translation
```jsx
<button onClick={handleSubmit}>
  {loading ? t('common.loading') : t('common.submit')}
</button>
```

### Form Input
```jsx
<input 
  placeholder={t('auth.email')}
  value={formData.email}
/>
```

### Conditional Translation
```jsx
<p>
  {user?.role === 'admin' 
    ? t('admin.dashboard') 
    : t('user.dashboard')}
</p>
```

### Dynamic List Translation
```jsx
{CATEGORIES.map(cat => (
  <option key={cat} value={cat}>
    {t(`categories.${cat.toLowerCase()}`)}
  </option>
))}
```

## ✅ What's Translated

- ✅ All authentication pages (login, register)
- ✅ User dashboard and reports
- ✅ Admin dashboard and controls
- ✅ Report form and fields
- ✅ All buttons and labels
- ✅ Status and priority labels
- ✅ All 8 issue categories
- ✅ Error and validation messages
- ✅ Success and warning messages
- ✅ Filter and sort options

## ⚠️ What's NOT Yet Translated

- ⚠️ Admin report card component
- ⚠️ User report card component
- ⚠️ Report chart component
- ⚠️ Report map component
- ⚠️ Photo upload section
- ⚠️ Location section
- ⚠️ Form action buttons
- ⚠️ Backend API messages
- ⚠️ Report data (timestamps, descriptions)

## 🔄 File Structure

```
/src
├── locales/
│   ├── en/
│   │   └── common.json          (English - 108 keys)
│   ├── hi/
│   │   └── common.json          (Hindi - 108 keys)
│   └── mr/
│       └── common.json          (Marathi - 108 keys)
├── hooks/
│   └── useTranslation.js        (i18n hook)
├── components/
│   └── common/
│       └── LanguageSwitcher.jsx (language selector)
└── pages/
    ├── Login.jsx               (translated)
    ├── Register.jsx            (translated)
    ├── UserDashboard.jsx       (translated)
    ├── AdminDashboard.jsx      (translated)
    └── ReportForm.jsx          (translated)
```

## 🎯 Next Steps to Complete

To translate remaining components, follow this pattern:

```jsx
// 1. Import
import useTranslation from '../hooks/useTranslation';

// 2. Use in component
const { t, direction } = useTranslation();

// 3. Wrap with dir attribute
return <div dir={direction}>

// 4. Replace strings
{/* Before */}
<p>Status: In Progress</p>

{/* After */}
<p>{t('report.status')}: {t('status.inProgress')}</p>
```

## 💡 Tips

1. **Always wrap containers with `dir={direction}`** for future RTL support
2. **Use dot notation for keys** like `section.subsection.key`
3. **Group related translations** by feature or page
4. **Add translations to ALL 3 language files** at the same time
5. **Keep key names consistent** - don't use spaces or special characters
6. **Test in all languages** before considering a feature complete

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Translation shows key instead of text | Check spelling and dot notation |
| Language doesn't persist | Check localStorage and browser settings |
| Component not translating | Import hook, add `dir={direction}`, replace strings |
| Mixed language on page | Ensure all text uses `t()` function |
| Performance slow | Avoid calling hook multiple times |

## 📞 Need Help?

1. Check `/src/locales/` for existing translation examples
2. Review `I18N_EXTENSION_GUIDE.md` for detailed patterns
3. Look at translated components like `Login.jsx`
4. Refer to `I18N_IMPLEMENTATION_STATUS.md` for overview

---

**Current Status: 71% of UI Translated ✅**
