import { NextRequest, NextResponse } from 'next/server';
import {
  deleteTemplateHtml,
  readTemplateHtml,
  readTemplatesFile,
  writeTemplateHtml,
  writeTemplatesFile,
} from '@/lib/email-templates';

const errorResponse = (message: string, status = 500) =>
  NextResponse.json({ success: false, error: message }, { status });

type Params = {
  params: {
    id: string;
  };
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const { name, description = '', subject, html } = body;

    if (!name || !subject || !html) {
      return errorResponse('Missing required fields: name, subject, html.', 400);
    }

    const templates = await readTemplatesFile();
    const templateIndex = templates.findIndex((template) => template.id === params.id);

    if (templateIndex === -1) {
      return errorResponse('Template not found.', 404);
    }

    const template = templates[templateIndex];
    await writeTemplateHtml(template.filePath, html);

    const updatedTemplate = {
      ...template,
      name,
      description,
      subject,
      updatedAt: new Date().toISOString(),
    };

    templates[templateIndex] = updatedTemplate;
    await writeTemplatesFile(templates);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedTemplate,
        html,
      },
    });
  } catch (error) {
    console.error(`Failed to update email template ${params.id}:`, error);
    return errorResponse('Failed to update email template.');
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const templates = await readTemplatesFile();
    const templateIndex = templates.findIndex((template) => template.id === params.id);

    if (templateIndex === -1) {
      return errorResponse('Template not found.', 404);
    }

    const template = templates[templateIndex];
    templates.splice(templateIndex, 1);
    await deleteTemplateHtml(template.filePath);
    await writeTemplatesFile(templates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete email template ${params.id}:`, error);
    return errorResponse('Failed to delete email template.');
  }
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const templates = await readTemplatesFile();
    const template = templates.find((item) => item.id === params.id);

    if (!template) {
      return errorResponse('Template not found.', 404);
    }

    const html = await readTemplateHtml(template.filePath);

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        html,
      },
    });
  } catch (error) {
    console.error(`Failed to load email template ${params.id}:`, error);
    return errorResponse('Failed to load email template.');
  }
}

