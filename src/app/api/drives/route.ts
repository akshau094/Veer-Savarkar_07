import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'drives.json');

export async function GET() {
  try {
    try {
      await fs.access(DATA_FILE);
    } catch {
      return NextResponse.json([]);
    }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDrive = await request.json();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const drives = JSON.parse(data);
    
    drives.push(newDrive);
    
    await fs.writeFile(DATA_FILE, JSON.stringify(drives, null, 2));
    return NextResponse.json(newDrive);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save drive' }, { status: 500 });
  }
}
