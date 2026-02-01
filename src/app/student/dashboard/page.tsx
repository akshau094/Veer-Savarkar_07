'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getDrives, CompanyDrive } from '@/lib/mockData';

interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [drives, setDrives] = useState<CompanyDrive[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Student Profile
      let currentProfile = null;
      const savedProfile = localStorage.getItem('studentProfile');
      if (savedProfile) {
        currentProfile = JSON.parse(savedProfile);
        setProfile(currentProfile);
      } else {
        const res = await fetch('/api/students');
        const students = await res.json();
        currentProfile = students.find((s: any) => s.id === 's1');
        if (currentProfile) {
          setProfile(currentProfile);
          localStorage.setItem('studentProfile', JSON.stringify(currentProfile));
        }
      }

      // 2. Load Drives
      const allDrives = await getDrives();
      setDrives(allDrives);

      // 3. Load Applications from local system
      if (currentProfile) {
        try {
          const appRes = await fetch(`/api/applications?studentId=${currentProfile.id}`);
          const apps = await appRes.json();
          setApplications(apps.map((a: any) => a.driveId));
        } catch (e) {
          console.error('Failed to load applications:', e);
        }
      }
    };

    loadData();
  }, []);

  const checkEligibility = (drive: CompanyDrive): EligibilityResult => {
    if (!profile) return { isEligible: false, reasons: ['Profile not completed'] };

    const reasons: string[] = [];
    let isEligible = true;

    // CGPA Check
    const studentCgpa = parseFloat(profile.cgpa);
    if (studentCgpa >= drive.criteria.minCgpa) {
      reasons.push(`Eligible because CGPA ${studentCgpa} >= ${drive.criteria.minCgpa}`);
    } else {
      reasons.push(`Not eligible because CGPA ${studentCgpa} < ${drive.criteria.minCgpa}`);
      isEligible = false;
    }

    // Branch Check
    if (drive.criteria.allowedBranches.includes(profile.branch)) {
      reasons.push(`Eligible because branch ${profile.branch} is allowed`);
    } else {
      reasons.push(`Not eligible because branch ${profile.branch} is not in allowed list (${drive.criteria.allowedBranches.join(', ')})`);
      isEligible = false;
    }

    // Backlog Check
    const studentBacklogs = parseInt(profile.backlogs);
    if (studentBacklogs <= drive.criteria.maxBacklogs) {
      reasons.push(`Eligible because backlogs ${studentBacklogs} <= ${drive.criteria.maxBacklogs} allowed`);
    } else {
      reasons.push(`Not eligible because backlogs ${studentBacklogs} > ${drive.criteria.maxBacklogs} allowed`);
      isEligible = false;
    }

    return { isEligible, reasons };
  };

  const handleApply = async (driveId: string) => {
    if (!profile) return;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.id,
          driveId: driveId
        }),
      });

      if (res.ok) {
        setApplications(prev => [...prev, driveId]);
        alert('Application submitted and saved locally!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to apply');
      }
    } catch (e) {
      alert('Error connecting to the local system');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile.name} ({profile.branch})</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Placement Drives</h2>
          
          {drives.map(drive => {
            const { isEligible, reasons } = checkEligibility(drive);
            const isApplied = applications.includes(drive.id);

            return (
              <div key={drive.id} className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-blue-600">{drive.name}</h3>
                      <p className="text-gray-600 font-medium">{drive.role}</p>
                      <p className="text-sm text-gray-500 mt-1">Package: {drive.package}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Eligibility Details:</h4>
                    <ul className="mt-2 space-y-1">
                      {reasons.map((reason, idx) => (
                        <li key={idx} className={`text-sm ${reason.startsWith('Eligible') ? 'text-green-600' : 'text-red-600'}`}>
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      disabled={!isEligible || isApplied}
                      onClick={() => handleApply(drive.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isApplied 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : isEligible 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isApplied ? 'Applied' : isEligible ? 'Apply Now' : 'Cannot Apply'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
