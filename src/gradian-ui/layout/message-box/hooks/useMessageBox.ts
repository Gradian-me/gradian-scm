'use client';

import { useMemo } from 'react';
import { useLanguageStore } from '@/stores/language.store';
import { Message, MessagesResponse } from '../types';

/**
 * Get localized message from a message value
 */
const getLocalizedMessage = (
  message: string | Record<string, string>,
  language: string
): string => {
  if (typeof message === 'string') {
    return message;
  }
  
  if (typeof message === 'object' && message !== null) {
    return message[language] || message['en'] || message[Object.keys(message)[0]] || '';
  }
  
  return '';
};

/**
 * Hook to extract and localize messages from API response
 */
export const useMessageBox = (response?: MessagesResponse | any) => {
  const language = useLanguageStore((state) => state.getLanguage());

  const processedMessages = useMemo(() => {
    if (!response) {
      return [];
    }

    const result: Array<{ path?: string; text: string }> = [];
    const messages = response.messages || [];
    const message = response.message;

    // Handle single message
    if (message) {
      const text = getLocalizedMessage(message, language);
      if (text) {
        result.push({ text });
      }
    }

    // Handle messages array
    messages.forEach((msg: Message) => {
      const text = getLocalizedMessage(msg.message, language);
      if (text) {
        result.push({
          path: msg.path,
          text,
        });
      }
    });

    return result;
  }, [response, language]);

  const hasMessages = processedMessages.length > 0;

  return {
    messages: processedMessages,
    hasMessages,
    language,
  };
};

