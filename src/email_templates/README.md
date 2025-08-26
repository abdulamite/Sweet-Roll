# Email Templates

This directory contains all email templates for the application using Handlebars templating engine.

## Directory Structure

```
email_templates/
├── layouts/           # Layout templates (wrapping templates)
│   └── base.hbs      # Main layout with styling
├── partials/          # Reusable template components
│   ├── button.hbs    # Call-to-action button
│   └── highlight-box.hbs # Highlighted content box
└── templates/         # Main email templates
    ├── welcome.hbs           # User welcome email
    ├── school-welcome.hbs    # School onboarding welcome
    ├── password-reset.hbs    # Password reset email
    └── notification.hbs      # General notifications
```

## Available Templates

### 1. Welcome (`welcome.hbs`)

- **Purpose**: Welcome new users to the platform
- **Variables**: `userName`, `companyName`, `actionUrl`, `supportEmail`
- **Usage**: User registration, account creation

### 2. School Welcome (`school-welcome.hbs`)

- **Purpose**: Welcome new schools after onboarding
- **Variables**: `schoolName`, `ownerName`, `schoolPhone`, `schoolWebsite`, `dashboardUrl`
- **Usage**: School onboarding completion

### 3. Password Reset (`password-reset.hbs`)

- **Purpose**: Password reset instructions
- **Variables**: `userName`, `resetUrl`, `expirationTime`
- **Usage**: Password reset requests

### 4. Notification (`notification.hbs`)

- **Purpose**: General notifications and alerts
- **Variables**: `notificationTitle`, `message`, `userName`, `isUrgent`, `actionRequired`, `actionUrl`
- **Usage**: System notifications, alerts, updates

## Template Variables

### Global Variables (Available to all templates)

- `companyName` - Company/platform name
- `supportEmail` - Support contact email
- `currentYear` - Current year for copyright
- `showHeader` - Whether to show email header
- `unsubscribeUrl` - Unsubscribe link

### Layout Variables

- `subject` - Email subject line
- `body` - Rendered template content
- `headerSubtitle` - Optional header subtitle

## Partials

### Button (`{{> button url="..." text="..."}}`)

Creates a styled call-to-action button

### Highlight Box (`{{> highlight-box title="..." content="..."}}`)

Creates a highlighted content box for important information

## Usage Examples

### In Code

```typescript
const resendService = new ResendService();

// Send welcome email
await resendService.sendWelcomeEmail('user@example.com', 'John Doe', {
  actionUrl: 'https://app.com/dashboard',
  companyName: 'My Company',
});

// Send custom template
await resendService.sendTemplatedEmail({
  to: 'user@example.com',
  templateName: 'welcome',
  subject: 'Welcome!',
  templateData: {
    userName: 'John',
    customVar: 'Custom Value',
  },
});
```

### Testing Templates

Use the email test endpoints to preview templates:

- `POST /email/test/welcome`
- `POST /email/test/school-welcome`
- `POST /email/test/password-reset`
- `POST /email/test/notification`
- `POST /email/test/custom`

## Adding New Templates

1. Create a new `.hbs` file in `templates/` directory
2. Use the base layout or create a custom layout
3. Include necessary partials with `{{> partial-name}}`
4. Add template variables as needed
5. Update the ResendService with a new method if needed
6. Test with the custom template endpoint

## Styling

All templates use the base layout (`layouts/base.hbs`) which includes:

- Responsive design
- Professional styling
- Company branding
- Consistent typography
- Mobile-friendly layout

## Handlebars Helpers

Custom helpers available in templates:

- `{{formatDate date "short"}}` - Format dates
- `{{uppercase text}}` - Convert to uppercase
- `{{eq a b}}` - Equality comparison
- `{{add a b}}` - Simple math operations
