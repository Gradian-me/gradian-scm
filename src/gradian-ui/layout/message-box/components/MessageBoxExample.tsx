'use client';

/**
 * Example component showing how to use MessageBox
 * This is for documentation purposes only
 */

import { useState } from 'react';
import { MessageBoxContainer, MessageBox } from '../index';
import { useLanguageStore } from '@/stores/language.store';

export function MessageBoxExample() {
  const [response, setResponse] = useState<any>(null);
  const language = useLanguageStore((state) => state.getLanguage());
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  // Example API response with multi-language messages
  const exampleResponse = {
    messages: [
      {
        path: 'username',
        message: {
          en: 'Username is required',
          fr: 'Le nom d\'utilisateur est requis',
          es: 'El nombre de usuario es obligatorio',
        },
      },
      {
        path: 'email',
        message: {
          en: 'Invalid email address',
          fr: 'Adresse e-mail invalide',
          es: 'Dirección de correo electrónico inválida',
        },
      },
    ],
  };

  const handleFetch = async () => {
    // Simulate API call
    setResponse(exampleResponse);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleFetch}
          className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
        >
          Simulate API Response
        </button>
        <div className="flex items-center gap-2">
          <span>Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 border rounded-lg"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>

      {/* Using MessageBoxContainer */}
      <MessageBoxContainer
        response={response}
        variant="error"
        dismissible
        onDismiss={() => setResponse(null)}
      />

      {/* Using MessageBox directly */}
      <MessageBox
        messages={[
          {
            path: 'example',
            message: {
              en: 'This is an example message',
              fr: 'Ceci est un message d\'exemple',
              es: 'Este es un mensaje de ejemplo',
            },
          },
        ]}
        variant="info"
        dismissible
      />
    </div>
  );
}

