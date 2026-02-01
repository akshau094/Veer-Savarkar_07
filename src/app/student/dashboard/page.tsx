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
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchAISuggestions = async (currentProfile: any) => {
    if (loadingAI) return;
    setLoadingAI(true);
    setAiSuggestions('');
    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentProfile: currentProfile }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || 'No suggestions available.');
    } catch (e) {
      console.error('AI Suggestion Error:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Student Profile
      let currentProfile = null;
      const savedProfile = localStorage.getItem('studentProfile');
      if (savedProfile) {
        currentProfile = JSON.parse(savedProfile);
        setProfile(currentProfile);
        fetchAISuggestions(currentProfile);
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

        {/* AI Suggestions Section */}
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 flex-grow">AI Career Assistant</h2>
            <button 
              onClick={() => fetchAISuggestions(profile)}
              disabled={loadingAI}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingAI ? 'Analyzing...' : 'Regenerate Suggestions'}
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-blue-50 min-h-[100px] relative">
            {loadingAI ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500 font-medium">Analyzing your profile...</span>
              </div>
            ) : aiSuggestions ? (
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                {aiSuggestions}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Set your GEMINI_API_KEY in your .env file to see AI-powered placement suggestions!
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Placement Drives</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Activity/Notification Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                {applications.filter(a => a.status !== 'Applied').length > 0 ? (
                  applications
                    .filter(a => a.status !== 'Applied')
                    .sort((a, b) => new Date(b.updatedAt || b.appliedAt).getTime() - new Date(a.updatedAt || a.appliedAt).getTime())
                    .map((app, idx) => {
                      const drive = drives.find(d => d.id === app.driveId);
                      return (
                        <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            app.status === 'Selected' ? 'bg-green-500' : 
                            app.status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {app.status} at {drive?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(app.updatedAt || app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 italic">No recent status updates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
