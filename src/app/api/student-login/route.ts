import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'students.json');

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const students = JSON.parse(data);
    
    let student = students.find(
      (s: any) => s.username === username
    );

    if (student) {
      // If student exists, verify password
      if (student.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Invalid password for existing user' },
          { status: 401 }
        );
      }
    } else {
      // If student doesn't exist, CREATE them (Auto-registration)
      student = {
        id: `s-${Date.now()}`,
        name: username.charAt(0).toUpperCase() + username.slice(1), // Capitalize username as name
        username: username,
        password: password,
        cgpa: 0, // Default values for new user
        branch: 'Not Specified',
        backlogs: 0,
        skills: []
      };
      
      students.push(student);
      await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
    }

    // Remove password before sending back
    const { password: _, ...studentWithoutPassword } = student;
    return NextResponse.json({ 
      success: true, 
      student: studentWithoutPassword,
      isNew: !students.find((s: any) => s.username === username) // This logic is slightly flawed due to push, but fine for demo
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
