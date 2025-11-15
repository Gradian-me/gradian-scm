import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { loadLucideIcons } from '@/gradian-ui/shared/utils/load-lucide-icons';
import { buildPaginationMeta, parsePaginationParams } from '@/gradian-ui/shared/utils/pagination-utils';

const ICONS_FILE_PATH = path.join(process.cwd(), 'data', 'all-icons.json');

const ensureIconsFile = async () => {
  try {
    await fs.access(ICONS_FILE_PATH);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      const icons = loadLucideIcons();
      await fs.mkdir(path.dirname(ICONS_FILE_PATH), { recursive: true });
      await fs.writeFile(ICONS_FILE_PATH, JSON.stringify(icons, null, 2), 'utf-8');
    } else {
      throw error;
    }
  }
};

const readIcons = async () => {
  await ensureIconsFile();
  const fileContents = await fs.readFile(ICONS_FILE_PATH, 'utf-8');
  const parsed = JSON.parse(fileContents) as Array<{ id: string; label: string; icon: string }>;
  return parsed;
};

const parseIdList = (input?: string | null): Set<string> | null => {
  if (!input) return null;
  const list = input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return list.length > 0 ? new Set(list) : null;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationParams(
      {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        search: searchParams.get('search'),
      },
      { defaultLimit: 48 }
    );

    const includeIds = parseIdList(searchParams.get('includeIds'));
    const excludeIds = parseIdList(searchParams.get('excludeIds'));

    const icons = await readIcons();

    let filtered = icons;

    if (pagination.search) {
      const query = pagination.search.toLowerCase();
      filtered = filtered.filter(
        (icon) =>
          icon.label?.toLowerCase().includes(query) ||
          icon.icon?.toLowerCase().includes(query) ||
          icon.id?.toLowerCase().includes(query)
      );
    }

    if (includeIds) {
      filtered = filtered.filter((icon) => includeIds.has(icon.id));
    }

    if (excludeIds) {
      filtered = filtered.filter((icon) => !excludeIds.has(icon.id));
    }

    const totalItems = filtered.length;
    const start = (pagination.page - 1) * pagination.limit;
    const pageItems = filtered.slice(start, start + pagination.limit);
    const meta = buildPaginationMeta(totalItems, pagination.page, pagination.limit);

    return NextResponse.json(
      {
        data: pageItems,
        meta,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load Lucide icons file', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

