import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'tokens.json');

type TokenRecord = {
  slug: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  mintAddress?: string;
  createdAt: string;
};

const readTokens = async (): Promise<TokenRecord[]> => {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as TokenRecord[];
};

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const tokens = await readTokens();
    const match = tokens.find((token) => token.slug === params.token);

    if (!match) {
      return NextResponse.json({ error: 'Token not found.' }, { status: 404 });
    }

    return NextResponse.json({ token: match });
  } catch (error) {
    return NextResponse.json({ error: 'Token registry unavailable.' }, { status: 500 });
  }
}
