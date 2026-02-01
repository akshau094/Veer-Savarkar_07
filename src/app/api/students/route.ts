import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'students.json');

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
    const studentData = await request.json();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const students = JSON.parse(data);
    
    // Update if exists, else add
    const index = students.findIndex((s: any) => s.id === studentData.id);
    if (index > -1) {
      students[index] = studentData;
    } else {
      students.push(studentData);
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
    return NextResponse.json(studentData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save student data' }, { status: 500 });
  }
}
