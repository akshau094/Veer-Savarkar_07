import { NextResponse } from 'next/server';
import { getPlacementSuggestions } from '@/lib/ai';
import fs from 'fs/promises';
import path from 'path';

const DRIVES_FILE = path.join(process.cwd(), 'data', 'drives.json');

export async function POST(request: Request) {
  try {
    const { studentProfile } = await request.json();
    
    // Load current drives to pass to AI
    const drivesData = await fs.readFile(DRIVES_FILE, 'utf8');
    const drives = JSON.parse(drivesData);

    const suggestions = await getPlacementSuggestions(studentProfile, drives);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: "Failed to get AI suggestions" }, { status: 500 });
  }
}
