# MessageBox Component

A component for displaying API response messages with multi-language support.

## Features

- Multi-language message support
- Automatic language detection from Zustand store
- Displays messages with optional path information
- Multiple variants (default, error, warning, success, info)
- Dismissible option
- Dark mode support

## Usage

### Basic Usage

```tsx
import { MessageBoxContainer } from '@/gradian-ui/layout/message-box';

// In your component
const response = await fetch('/api/endpoint');
const data = await response.json();

<MessageBoxContainer 
  response={data} 
  variant="error" 
  dismissible 
/>
```

### With Direct Messages

```tsx
import { MessageBox } from '@/gradian-ui/layout/message-box';

<MessageBox
  messages={[
    { path: 'username', message: { en: 'Username is required', fr: 'Le nom d\'utilisateur est requis' } },
    { path: 'email', message: { en: 'Invalid email', fr: 'Email invalide' } }
  ]}
  variant="error"
  dismissible
/>
```

### Using the Hook

```tsx
import { useMessageBox } from '@/gradian-ui/layout/message-box';
import { MessageBox } from '@/gradian-ui/layout/message-box';

function MyComponent() {
  const response = useSomeApiCall();
  const { messages, hasMessages } = useMessageBox(response);

  if (!hasMessages) return null;

  return (
    <MessageBox
      messages={messages.map(m => ({ path: m.path, message: m.text }))}
      variant="error"
    />
  );
}
```

## Language Store

The component uses the language store to determine which language to display:

```tsx
import { useLanguageStore } from '@/stores/language.store';

// Set language
const setLanguage = useLanguageStore((state) => state.setLanguage);
setLanguage('fr'); // Change to French

// Get current language
const language = useLanguageStore((state) => state.getLanguage());
// Returns 'en' by default
```

## API Response Format

The component expects responses in one of these formats:

```typescript
// Format 1: With messages array
{
  messages: [
    { 
      path: 'fieldName', 
      message: { en: 'Error message', fr: 'Message d\'erreur' } 
    }
  ]
}

// Format 2: Single message
{
  message: { en: 'Error message', fr: 'Message d\'erreur' }
}

// Format 3: Simple string (will be used for all languages)
{
  message: 'Error message'
}
```

## Props

### MessageBoxContainer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| response | `MessagesResponse \| any` | - | API response object containing messages |
| variant | `'default' \| 'error' \| 'warning' \| 'success' \| 'info'` | `'default'` | Visual variant |
| dismissible | `boolean` | `false` | Whether the message can be dismissed |
| className | `string` | - | Additional CSS classes |
| onDismiss | `() => void` | - | Callback when message is dismissed |

### MessageBox

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| messages | `Message[]` | `[]` | Array of messages with optional paths |
| message | `string \| Record<string, string>` | - | Single message (string or language object) |
| variant | `'default' \| 'error' \| 'warning' \| 'success' \| 'info'` | `'default'` | Visual variant |
| dismissible | `boolean` | `false` | Whether the message can be dismissed |
| className | `string` | - | Additional CSS classes |
| onDismiss | `() => void` | - | Callback when message is dismissed |

