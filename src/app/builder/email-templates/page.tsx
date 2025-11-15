'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
  createdAt?: string;
  updatedAt?: string;
};

const placeholderPattern = /{{\s*([\w.-]+)\s*}}/g;

const renderWithValues = (content: string | undefined, values: Record<string, string>) =>
  (content ?? '').replace(placeholderPattern, (_, key: string) =>
    values[key] !== undefined && values[key] !== '' ? values[key] : `{{${key}}}`,
  );

const extractPlaceholders = (content: string | undefined) => {
  if (!content) return [];
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = placeholderPattern.exec(content)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
};

const blankTemplateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{subject}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="font-family: Arial, sans-serif; padding: 24px;">
  <h1>Hello {{audience}}</h1>
  <p>Start crafting the HTML for your email here.</p>
</body>
</html>`;

export default function EmailTemplateBuilderPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [workingTemplate, setWorkingTemplate] = useState<EmailTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/email-templates');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load templates.');
        }

        setTemplates(data.data);
        setSelectedTemplateId((current) => {
          if (current && data.data.some((template: EmailTemplate) => template.id === current)) {
            return current;
          }
          return data.data[0]?.id ?? '';
        });
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load templates.';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const activeTemplate =
      templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null;
    setWorkingTemplate(activeTemplate ? { ...activeTemplate } : null);
    setPlaceholderValues({});
  }, [templates, selectedTemplateId]);

  const placeholders = useMemo(() => {
    if (!workingTemplate) return [];
    const subjectKeys = extractPlaceholders(workingTemplate.subject);
    const htmlKeys = extractPlaceholders(workingTemplate.html);
    return Array.from(new Set([...subjectKeys, ...htmlKeys]));
  }, [workingTemplate?.subject, workingTemplate?.html]);

  useEffect(() => {
    if (!workingTemplate) return;
    setPlaceholderValues((previous) => {
      const nextValues: Record<string, string> = { ...previous };
      placeholders.forEach((key) => {
        if (nextValues[key] === undefined) {
          nextValues[key] = '';
        }
      });
      Object.keys(nextValues).forEach((key) => {
        if (!placeholders.includes(key)) {
          delete nextValues[key];
        }
      });
      return nextValues;
    });
  }, [placeholders, workingTemplate]);

  const resolvedSubject = useMemo(() => {
    if (!workingTemplate) return '';
    return renderWithValues(workingTemplate.subject, placeholderValues);
  }, [workingTemplate?.subject, placeholderValues]);

  const resolvedHtml = useMemo(() => {
    if (!workingTemplate) return '';
    return renderWithValues(workingTemplate.html, placeholderValues);
  }, [workingTemplate?.html, placeholderValues]);

  const handleTemplateFieldChange = <K extends keyof EmailTemplate>(field: K, value: EmailTemplate[K]) => {
    if (!workingTemplate) return;
    setWorkingTemplate({ ...workingTemplate, [field]: value });
  };

  const handleCreateTemplate = async () => {
    setIsCreating(true);
    try {
      const payload = {
        name: 'New template',
        description: 'Describe when this template is used.',
        subject: 'New email subject for {{audience}}',
        html: blankTemplateHtml,
      };
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create template.');
      }

      setTemplates((current) => [...current, data.data]);
      setSelectedTemplateId(data.data.id);
      toast.success('Template created.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create template.';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!workingTemplate) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/email-templates/${workingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workingTemplate.name,
          description: workingTemplate.description,
          subject: workingTemplate.subject,
          html: workingTemplate.html,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save template.');
      }

      setTemplates((current) =>
        current.map((template) => (template.id === data.data.id ? data.data : template)),
      );
      toast.success('Template saved.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save template.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!workingTemplate) return;
    const confirmed = window.confirm(
      `Delete "${workingTemplate.name}" template? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/email-templates/${workingTemplate.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete template.');
      }

      const remainingTemplates = templates.filter((template) => template.id !== workingTemplate.id);
      setTemplates(remainingTemplates);
      setSelectedTemplateId((currentId) =>
        currentId === workingTemplate.id ? remainingTemplates[0]?.id ?? '' : currentId,
      );
      toast.success('Template deleted.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete template.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues((current) => ({ ...current, [key]: value }));
  };

  const renderEmptyState = () => (
    <Card>
      <CardHeader>
        <CardTitle>No templates yet</CardTitle>
        <CardDescription>Start by creating your first email template.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleCreateTemplate} disabled={isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create template
        </Button>
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <MainLayout
        title="Email Template Generator"
        subtitle="Design, personalize, and preview transactional Gradian.me emails"
        icon="Mail"
      >
        <div className="py-6">
          <Card>
            <CardContent className="flex items-center gap-3 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading templates...</span>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Email Template Generator"
      subtitle="Design, personalize, and preview transactional Gradian.me emails"
      icon="Mail"
    >
      <div className="py-4 md:py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Gradian.me communications
          </p>
          <h1 className="text-3xl font-semibold">Email template generator</h1>
          <p className="text-muted-foreground">
            Create domain-specific HTML emails, define placeholders, and preview personalized values instantly.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {templates.length === 0 || !workingTemplate ? (
          renderEmptyState()
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>Templates</CardTitle>
                    <CardDescription>Switch between reusable layouts.</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreateTemplate} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => {
                  const isActive = template.id === workingTemplate.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? 'border-violet-500/60 bg-violet-500/5 shadow-sm'
                          : 'border-border hover:border-violet-500/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{template.name}</p>
                        {isActive && <Badge variant="secondary">Active</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template details</CardTitle>
                  <CardDescription>Update the metadata and HTML source.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template name</Label>
                      <Input
                        id="template-name"
                        value={workingTemplate.name}
                        onChange={(event) => handleTemplateFieldChange('name', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-description">Description</Label>
                      <Input
                        id="template-description"
                        value={workingTemplate.description}
                        onChange={(event) => handleTemplateFieldChange('description', event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Subject</Label>
                    <Input
                      id="template-subject"
                      value={workingTemplate.subject}
                      onChange={(event) => handleTemplateFieldChange('subject', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-html">HTML content</Label>
                    <Textarea
                      id="template-html"
                      className="font-mono text-sm h-[420px]"
                      value={workingTemplate.html}
                      onChange={(event) => handleTemplateFieldChange('html', event.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Placeholders use double braces syntax, for example <code>{'{{userName}}'}</code>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDeleteTemplate}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                    <Button onClick={handleSaveTemplate} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save template
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personalize & preview</CardTitle>
                  <CardDescription>Fill placeholder values to see the rendered email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {placeholders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {placeholders.map((key) => (
                        <div className="space-y-1.5" key={key}>
                          <Label htmlFor={`placeholder-${key}`}>{key}</Label>
                          <Input
                            id={`placeholder-${key}`}
                            placeholder={`Enter value for ${key}`}
                            value={placeholderValues[key] ?? ''}
                            onChange={(event) => handlePlaceholderChange(key, event.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                      No placeholders detected. Add <code>{'{{key}}'}</code> anywhere in the subject or HTML to start
                      personalizing this template.
                    </div>
                  )}

                  <Separator />

                  <Tabs defaultValue="preview">
                    <TabsList>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="subject">Rendered subject</TabsTrigger>
                      <TabsTrigger value="html">Resolved HTML</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview">
                      <div className="rounded-2xl border bg-background px-6 py-6">
                        <p className="text-sm font-semibold text-muted-foreground mb-4">{resolvedSubject}</p>
                        <div
                          className="prose max-w-none dark:prose-invert text-sm"
                          dangerouslySetInnerHTML={{ __html: resolvedHtml }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="subject">
                      <pre className="rounded-2xl border bg-muted/60 p-4 text-sm whitespace-pre-wrap">
                        {resolvedSubject}
                      </pre>
                    </TabsContent>
                    <TabsContent value="html">
                      <pre className="rounded-2xl border bg-muted/60 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                        {resolvedHtml}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

