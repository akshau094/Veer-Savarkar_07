import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'students.json');

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Read or initialize students array
    let students = [];
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      students = JSON.parse(data);
    } catch (e) {
      // File doesn't exist or is empty, start with empty array
      students = [];
    }
    
    let student = students.find(
      (s: any) => s.username === username
    );

    if (student) {
      // If student exists, verify password
      if (student.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Invalid password' },
          { status: 401 }
        );
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
      await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
    }

    // Return the student data
    return NextResponse.json({ 
      success: true, 
      student: student
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Server error during login' }, { status: 500 });
  }
}
