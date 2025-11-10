'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FormAlert } from '@/components/ui/form-alert';
import { SchemaFormWrapper } from '@/gradian-ui/form-builder';
import { asFormBuilderSchema } from '@/gradian-ui/schema-manager/utils/schema-utils';
import type { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { config } from '@/lib/config';
import { useCompanyStore } from '@/stores/company.store';

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const getCompanyId = useCompanyStore((state) => state.getCompanyId);

  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitFeedback, setSubmitFeedback] = useState<FeedbackState | null>(null);
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSchema = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.schemaApi.basePath}/users`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Unable to load user schema.');
        }

        if (isMounted) {
          setSchema(asFormBuilderSchema(result.data));
          setLoadError(null);
        }
      } catch (error) {
        console.error('Failed to load users schema:', error);
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : 'Failed to load schema. Please try again later.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSchema();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Sign Up | Gradian App';
    }
  }, []);

  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      const companyId = getCompanyId();

      if (!companyId) {
        setSubmitFeedback({
          type: 'error',
          message: 'Please select a company before creating an account.',
        });
        return;
      }

      setIsSubmitting(true);
      setSubmitFeedback(null);

      try {
        const response = await fetch('/api/data/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            companyId,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMessage = result.error || 'Failed to create user account. Please try again.';
          setSubmitFeedback({ type: 'error', message: errorMessage });
          return;
        }

        setSubmitFeedback({
          type: 'success',
          message: 'Account created successfully! Redirecting to the login page...',
        });

        // Redirect after a short delay to allow users to read the message
        setTimeout(() => {
          router.push('/authentication/login');
        }, 2000);
      } catch (error) {
        console.error('Error submitting signup form:', error);
        setSubmitFeedback({
          type: 'error',
          message: 'Something went wrong while creating your account. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [getCompanyId, router]
  );

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    if (loadError) {
      return (
        <FormAlert
          type="error"
          message={loadError}
          dismissible
          onDismiss={() => setLoadError(null)}
        />
      );
    }

    if (!schema) {
      return (
        <FormAlert
          type="error"
          message="Unable to load the sign up form at this time."
        />
      );
    }

    return (
      <SchemaFormWrapper
        schema={schema}
        onSubmit={handleSubmit}
        onMount={(submitFn) => setSubmitForm(() => submitFn)}
        hideActions
        disabled={isSubmitting}
      />
    );
  }, [isLoading, loadError, schema, handleSubmit, isSubmitting]);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="shadow-lg border border-slate-200">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Create your Gradian account
            </CardTitle>
            <p className="text-sm text-gray-500">
              Fill out the form below to get started. All fields marked with * are required.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {submitFeedback && (
              <FormAlert
                type={submitFeedback.type}
                message={submitFeedback.message}
                dismissible
                onDismiss={() => setSubmitFeedback(null)}
              />
            )}

            {renderContent}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <Button
                type="button"
                onClick={() => submitForm?.()}
                disabled={!submitForm || isSubmitting || isLoading || !!loadError}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
              <div className="text-sm text-gray-600 text-center sm:text-left">
                Already have an account?{' '}
                <Link href="/authentication/login" className="font-medium text-violet-600 hover:text-violet-700">
                  Sign in instead
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
