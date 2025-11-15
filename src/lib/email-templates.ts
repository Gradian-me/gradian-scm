import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { join, dirname, resolve } from 'path';

export type StoredEmailTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  filePath: string;
  createdAt?: string;
  updatedAt?: string;
};

const DATA_FILE = join(process.cwd(), 'data', 'all-templates.json');
const TEMPLATE_DIR = join(process.cwd(), 'src', 'app', 'builder', 'email-templates', 'templates');

const normalizePath = (value: string) => value.replace(/\\/g, '/');

const getAbsolutePath = (filePath: string) => {
  const absolute = resolve(process.cwd(), filePath);
  if (!normalizePath(absolute).startsWith(normalizePath(TEMPLATE_DIR))) {
    throw new Error('Invalid template path');
  }
  return absolute;
};

export const readTemplatesFile = async (): Promise<StoredEmailTemplate[]> => {
  try {
    const content = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

export const writeTemplatesFile = async (templates: StoredEmailTemplate[]) => {
  await writeFile(DATA_FILE, JSON.stringify(templates, null, 2), 'utf-8');
};

export const readTemplateHtml = async (filePath: string) => {
  try {
    const absolutePath = getAbsolutePath(filePath);
    return await readFile(absolutePath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '';
    }
    throw error;
  }
};

export const writeTemplateHtml = async (filePath: string, html: string) => {
  const absolutePath = getAbsolutePath(filePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, html, 'utf-8');
};

export const deleteTemplateHtml = async (filePath: string) => {
  try {
    const absolutePath = getAbsolutePath(filePath);
    await rm(absolutePath, { force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

export const templateDirRelativePath = (fileName: string) =>
  normalizePath(join('src', 'app', 'builder', 'email-templates', 'templates', fileName));

