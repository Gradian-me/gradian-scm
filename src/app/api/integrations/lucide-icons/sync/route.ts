import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { loadLucideIcons } from '@/gradian-ui/shared/utils/load-lucide-icons';

const ICONS_FILE_PATH = path.join(process.cwd(), 'data', 'all-icons.json');

const writeIconsFile = async () => {
  const icons = loadLucideIcons();
  await fs.mkdir(path.dirname(ICONS_FILE_PATH), { recursive: true });
  await fs.writeFile(ICONS_FILE_PATH, JSON.stringify(icons, null, 2), 'utf-8');
  return icons.length;
};

export async function POST() {
  try {
    const total = await writeIconsFile();
    return NextResponse.json({
      success: true,
      total,
      message: `Lucide icons synced to ${ICONS_FILE_PATH}`,
    });
  } catch (error) {
    console.error('Failed to sync Lucide icons', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}


