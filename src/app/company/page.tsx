'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getDrives, mockStudents, CompanyDrive, Student } from '@/lib/mockData';

export default function CompanyPortal() {
  const [drives, setDrives] = useState<CompanyDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<CompanyDrive | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Drives
      const allDrives = await getDrives();
      setDrives(allDrives);
      if (allDrives.length > 0) {
        setSelectedDrive(allDrives[0]);
      }

      // 2. Load Students from local system
      const studentRes = await fetch('/api/students');
      const studentData = await studentRes.json();
      setStudents(Array.isArray(studentData) ? studentData : []);

      // 3. Load Applications
      const appRes = await fetch('/api/applications');
      const appData = await appRes.json();
      setApplications(Array.isArray(appData) ? appData : []);
    };
    loadData();
  }, []);
  
  const checkEligibility = (student: Student, drive: CompanyDrive) => {
    const reasons: string[] = [];
    let isEligible = true;

    if (student.cgpa >= drive.criteria.minCgpa) {
      reasons.push(`Eligible: CGPA ${student.cgpa} >= ${drive.criteria.minCgpa}`);
    } else {
      reasons.push(`Not Eligible: CGPA ${student.cgpa} < ${drive.criteria.minCgpa}`);
      isEligible = false;
    }

    if (drive.criteria.allowedBranches.includes(student.branch)) {
      reasons.push(`Eligible: Branch ${student.branch} is allowed`);
    } else {
      reasons.push(`Not Eligible: Branch ${student.branch} not allowed`);
      isEligible = false;
    }

    if (student.backlogs <= drive.criteria.maxBacklogs) {
      reasons.push(`Eligible: Backlogs ${student.backlogs} <= ${drive.criteria.maxBacklogs}`);
    } else {
      reasons.push(`Not Eligible: Backlogs ${student.backlogs} > ${drive.criteria.maxBacklogs}`);
      isEligible = false;
    }

    return { isEligible, reasons };
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      if (res.ok) {
        const updatedApp = await res.json();
        setApplications(prev => prev.map(app => app.id === appId ? updatedApp : app));
      }
    } catch (e) {
      alert('Failed to update status locally');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Portal</h1>
            <p className="text-gray-600">Manage recruitment drives and check student eligibility.</p>
          </div>
          <Link
            href="/company/create-drive"
            title="Add New Company Drive"
            className="inline-flex items-center p-3 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Drive Selection */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Existing Drives</h2>
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
              <nav className="divide-y divide-gray-200">
                {drives.map(drive => (
                  <button
                    key={drive.id}
                    onClick={() => setSelectedDrive(drive)}
                    className={`w-full text-left px-4 py-4 text-sm font-medium transition-colors hover:bg-gray-50 ${
                      selectedDrive?.id === drive.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <div className="font-bold text-gray-900">{drive.name}</div>
                    <div className="text-gray-500">{drive.role}</div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content - Candidate Pool */}
          <div className="lg:col-span-3 space-y-6">
            {selectedDrive ? (
              <>
                <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Criteria for {selectedDrive.name}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded">
                      <span className="block text-gray-500">Min CGPA</span>
                      <span className="font-bold">{selectedDrive.criteria.minCgpa}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <span className="block text-gray-500">Max Backlogs</span>
                      <span className="font-bold">{selectedDrive.criteria.maxBacklogs}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded col-span-2">
                      <span className="block text-gray-500">Branches</span>
                      <span className="font-bold">{selectedDrive.criteria.allowedBranches.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Candidate Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Academic Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Eligibility (Explainability)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action / Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map(student => {
                        const { isEligible, reasons } = checkEligibility(student, selectedDrive);
                        const application = applications.find(
                          app => app.studentId === student.id && app.driveId === selectedDrive.id
                        );
                        
                        return (
                          <tr key={student.id} className={!isEligible ? 'bg-gray-50 opacity-60' : ''}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.branch} | Year: {student.year || 'N/A'}</div>
                              {application && (
                                <span className="mt-1 inline-block text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                                  Status: {application.status}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">CGPA: {student.cgpa}</div>
                              <div className="text-xs text-gray-500">Backlogs: {student.backlogs}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs">
                                {reasons && reasons.map((reason, idx) => (
                                  <div key={idx} className={`text-[11px] leading-tight mb-1 ${reason.includes('Eligible') && !reason.includes('Not') ? 'text-green-600' : 'text-red-600'}`}>
                                    • {reason}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              {application ? (
                                <select 
                                  value={application.status}
                                  onChange={(e) => handleUpdateStatus(application.id, e.target.value)}
                                  className="text-xs border rounded p-1"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Selected">Selected</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Not Applied</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-white shadow rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No drives found. Click the + button to add your first company drive.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
