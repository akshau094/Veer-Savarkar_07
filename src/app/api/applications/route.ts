import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'applications.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const driveId = searchParams.get('driveId');

    try {
      await fs.access(DATA_FILE);
    } catch {
      return NextResponse.json([]);
    }

    const data = await fs.readFile(DATA_FILE, 'utf8');
    let applications = JSON.parse(data);

    if (studentId) {
      applications = applications.filter((app: any) => app.studentId === studentId);
    }
    if (driveId) {
      applications = applications.filter((app: any) => app.driveId === driveId);
    }

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newApp = await request.json(); // { studentId, driveId, status, appliedAt }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const applications = JSON.parse(data);
    
    // Check if already applied
    const exists = applications.find(
      (app: any) => app.studentId === newApp.studentId && app.driveId === newApp.driveId
    );

    if (exists) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 });
    }

    const application = {
      id: `app-${Date.now()}`,
      ...newApp,
      appliedAt: new Date().toISOString(),
      status: 'Applied'
    };
    
    applications.push(application);
    await fs.writeFile(DATA_FILE, JSON.stringify(applications, null, 2));
    
    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const applications = JSON.parse(data);
    
    const index = applications.findIndex((app: any) => app.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    applications[index].status = status;
    applications[index].updatedAt = new Date().toISOString();
    
    await fs.writeFile(DATA_FILE, JSON.stringify(applications, null, 2));
    
    return NextResponse.json(applications[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
