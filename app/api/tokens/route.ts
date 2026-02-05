import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tokens.json');

type TokenRecord = {
  slug: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  mintAddress?: string;
  createdAt: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureStore = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
};

const readTokens = async (): Promise<TokenRecord[]> => {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as TokenRecord[];
};

const writeTokens = async (tokens: TokenRecord[]) => {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
};

export async function GET() {
  const tokens = await readTokens();
  return NextResponse.json({ tokens });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = (body.name || '').toString().trim();
  const symbol = (body.symbol || '').toString().trim();
  const description = (body.description || '').toString().trim();
  const imageUrl = (body.imageUrl || '').toString().trim();
  const mintAddress = (body.mintAddress || '').toString().trim();

  if (!name || !symbol || !description || !imageUrl) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const slug = slugify(name);
  const tokens = await readTokens();

  if (tokens.some((token) => token.slug === slug)) {
    return NextResponse.json({ error: 'Token already exists.' }, { status: 409 });
  }

  const record: TokenRecord = {
    slug,
    name,
    symbol,
    description,
    imageUrl,
    mintAddress: mintAddress || undefined,
    createdAt: new Date().toISOString(),
  };

  tokens.push(record);
  await writeTokens(tokens);

  return NextResponse.json({ token: record }, { status: 201 });
}
