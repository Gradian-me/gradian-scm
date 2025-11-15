import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  readTemplatesFile,
  writeTemplatesFile,
  readTemplateHtml,
  writeTemplateHtml,
  templateDirRelativePath,
  StoredEmailTemplate,
} from '@/lib/email-templates';

const errorResponse = (message: string, status = 500) =>
  NextResponse.json({ success: false, error: message }, { status });

const normalizeId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const generateTemplateId = (name: string, templates: StoredEmailTemplate[]) => {
  const base = normalizeId(name) || normalizeId(randomUUID());
  let candidate = base;
  let counter = 1;
  while (templates.some((template) => template.id === candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
};

export async function GET() {
  try {
    const templates = await readTemplatesFile();
    const data = await Promise.all(
      templates.map(async (template) => ({
        ...template,
        html: await readTemplateHtml(template.filePath),
      })),
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to load email templates:', error);
    return errorResponse('Failed to load email templates.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description = '', subject, html, id: requestedId } = body;

    if (!name || !subject || !html) {
      return errorResponse('Missing required fields: name, subject, html.', 400);
    }

    const templates = await readTemplatesFile();
    const newId = requestedId ? normalizeId(requestedId) : generateTemplateId(name, templates);

    if (!newId) {
      return errorResponse('Unable to determine a valid template id.', 400);
    }

    if (templates.some((template) => template.id === newId)) {
      return errorResponse(`Template with id "${newId}" already exists.`, 409);
    }

    const filePath = templateDirRelativePath(`${newId}.html`);
    await writeTemplateHtml(filePath, html);

    const timestamp = new Date().toISOString();
    const newTemplate: StoredEmailTemplate = {
      id: newId,
      name,
      description,
      subject,
      filePath,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await writeTemplatesFile([...templates, newTemplate]);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newTemplate,
          html,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create email template:', error);
    return errorResponse('Failed to create email template.');
  }
}

