'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getDrives, CompanyDrive, mockStudents, Student } from '@/lib/mockData';
import Link from 'next/link';

export default function CompanyDashboard() {
  const [drives, setDrives] = useState<CompanyDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<CompanyDrive | null>(null);

  useEffect(() => {
    setDrives(getDrives());
  }, []);

  const checkEligibility = (student: Student, drive: CompanyDrive) => {
    const reasons: string[] = [];
    let isEligible = true;

    if (student.cgpa < drive.criteria.minCgpa) {
      isEligible = false;
      reasons.push(`CGPA ${student.cgpa} < ${drive.criteria.minCgpa}`);
    }
    if (!drive.criteria.allowedBranches.includes(student.branch)) {
      isEligible = false;
      reasons.push(`Branch ${student.branch} not allowed`);
    }
    if (student.backlogs > drive.criteria.maxBacklogs) {
      isEligible = false;
      reasons.push(`Backlogs ${student.backlogs} > ${drive.criteria.maxBacklogs}`);
    }

    return { isEligible, reasons };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-600">Manage your recruitment drives and view eligible candidates.</p>
          </div>
          <Link
            href="/company/create-drive"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            + Create New Drive
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drives List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Drives</h2>
            {drives.map(drive => (
              <div
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedDrive?.id === drive.id
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <h3 className="font-bold text-gray-900">{drive.name}</h3>
                <p className="text-sm text-gray-600">{drive.role}</p>
                <p className="text-xs text-gray-500 mt-1">Package: {drive.package}</p>
              </div>
            ))}
          </div>

          {/* Eligible Students List */}
          <div className="lg:col-span-2">
            {selectedDrive ? (
              <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">
                    Eligible Candidates for {selectedDrive.name} - {selectedDrive.role}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockStudents.map(student => {
                        const { isEligible, reasons } = checkEligibility(student, selectedDrive);
                        return (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.cgpa}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.branch}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isEligible ? 'Eligible' : 'Not Eligible'}
                              </span>
                              {!isEligible && (
                                <p className="text-[10px] text-red-500 mt-1">{reasons[0]}</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-gray-500">Select a drive from the list to view eligible students.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
