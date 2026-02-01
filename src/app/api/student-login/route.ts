import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'students.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { username, password } = body;
    
    // Default values if empty
    username = username || 'guest';
    password = password || 'password';
    
    console.log('Login attempt for:', username);

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      try {
        await fs.mkdir(dataDir, { recursive: true });
      } catch (e) {
        console.error('Failed to create data directory:', e);
      }
    }

    // Read or initialize students array
    let students = [];
    try {
      if (await fs.access(DATA_FILE).then(() => true).catch(() => false)) {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        students = JSON.parse(data);
      }
      if (!Array.isArray(students)) {
        students = [];
      }
    } catch (e) {
      console.error('Failed to read students file:', e);
      students = [];
    }
    
    let student = students.find(
      (s: any) => s.username === username
    );

    if (student) {
      // For hackathon: If user exists, just update their password and let them in
      student.password = password;
      try {
        await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
      } catch (writeError) {
        console.warn('Could not save password update (normal on Vercel):', writeError);
      }
    } else {
      // If student doesn't exist, CREATE them (Auto-registration)
      student = {
        id: `s-${Date.now()}`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username: username,
        password: password,
        cgpa: "0",
        branch: 'Not Specified',
        backlogs: "0",
        skills: ""
      };
      
      students.push(student);
      try {
        await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
      } catch (writeError) {
        console.warn('Could not save new student (normal on Vercel):', writeError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      student: student
    });
  } catch (error: any) {
    console.error('Global login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Server error during login' 
    }, { status: 500 });
  }
}
