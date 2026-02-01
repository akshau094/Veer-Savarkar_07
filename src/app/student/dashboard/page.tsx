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
  const [applications, setApplications] = useState<any[]>([]);
  const [drives, setDrives] = useState<CompanyDrive[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Student Profile
      let currentProfile = null;
      const savedProfile = localStorage.getItem('studentProfile');
      if (savedProfile) {
        currentProfile = JSON.parse(savedProfile);
        setProfile(currentProfile);
      }

      // 2. Load Drives
      const allDrives = await getDrives();
      setDrives(allDrives);

      // 3. Load Applications from local system
      if (currentProfile) {
        try {
          const appRes = await fetch(`/api/applications?studentId=${currentProfile.id}`);
          const apps = await appRes.json();
          setApplications(Array.isArray(apps) ? apps : []);
        } catch (e) {
          console.error('Failed to load applications:', e);
        }
      }
    };

    loadData();
  }, []);

  const checkEligibility = (drive: CompanyDrive): EligibilityResult => {
    if (!profile) return { isEligible: false, reasons: ['Profile not completed'] };

    // Check if profile is complete (CGPA and Branch are mandatory for eligibility)
    if (!profile.cgpa || profile.branch === 'Not Specified' || !profile.branch) {
      return { isEligible: false, reasons: ['Please complete your profile (CGPA & Branch) to check eligibility'] };
    }

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
        const newApp = await res.json();
        setApplications(prev => [...prev, newApp]);
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

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Placement Drives</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map(drive => {
            const { isEligible, reasons } = checkEligibility(drive);
            const application = applications.find(app => app.driveId === drive.id);
            const isApplied = !!application;
            
            return (
              <div key={drive.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{drive.name}</h3>
                    <p className="text-sm text-gray-500">{drive.role}</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {drive.package}
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Criteria:</span>
                    {drive.criteria.minCgpa} CGPA, {drive.criteria.maxBacklogs} Backlogs
                  </div>
                  
                  {/* Explainability Section */}
                  <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Eligibility Explanation</p>
                    <ul className="space-y-1">
                      {reasons.map((reason, idx) => (
                        <li key={idx} className={`text-[11px] leading-tight ${reason.startsWith('Eligible') ? 'text-green-600' : 'text-red-600'}`}>
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  {isApplied ? (
                    <div className="space-y-2">
                      <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                        Applied
                      </button>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-xs text-gray-500 italic">Current Status:</span>
                        <span className={`text-xs font-bold uppercase ${
                          application.status === 'Selected' ? 'text-green-600' : 
                          application.status === 'Rejected' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(drive.id)}
                      disabled={!isEligible}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        isEligible 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isEligible ? 'Apply Now' : 'Not Eligible'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </main>
    </div>
  );
}
