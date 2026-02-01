'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { CompanyDrive } from '@/lib/mockData';

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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = (textToSpeak?: string) => {
    if (typeof window === 'undefined') return;

    // Always stop any current speech first
    window.speechSynthesis.cancel();

    // If we're already speaking and just toggled (without new text), then stop
    if (isSpeaking && !textToSpeak) {
      setIsSpeaking(false);
      return;
    }

    const targetText = textToSpeak || aiSuggestions;
    if (!targetText) {
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const fetchAISuggestions = async (currentProfile: any) => {
    if (loadingAI) return;
    setLoadingAI(true);
    setAiSuggestions('');
    
    // Stop any current speech when fetching new suggestions
    if (typeof window !== 'undefined' && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentProfile: currentProfile }),
      });
      const data = await res.json();
      const suggestions = data.suggestions || 'No suggestions available.';
      setAiSuggestions(suggestions);
      
      // Automatically speak the response once generated
      if (suggestions && suggestions !== 'No suggestions available.') {
        toggleSpeech(suggestions);
      }
    } catch (e) {
      console.error('AI Suggestion Error:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('Dashboard: Loading data...');
      // 1. Load Student Profile
      let currentProfile = null;
      try {
        const savedProfile = localStorage.getItem('studentProfile');
        if (savedProfile) {
          currentProfile = JSON.parse(savedProfile);
          console.log('Dashboard: Profile loaded', currentProfile);
          setProfile(currentProfile);
          // Only fetch suggestions if we have a valid profile
          if (currentProfile && currentProfile.name) {
            fetchAISuggestions(currentProfile);
          }
        } else {
          console.warn('Dashboard: No profile found in localStorage');
        }
      } catch (e) {
        console.error('Dashboard: Failed to parse profile:', e);
      }

      // 2. Load Drives
      try {
        const driveRes = await fetch('/api/drives');
        if (driveRes.ok) {
          const allDrives = await driveRes.json();
          console.log('Dashboard: Drives loaded', allDrives);
          setDrives(Array.isArray(allDrives) ? allDrives : []);
        } else {
          console.error('Dashboard: Failed to fetch drives', driveRes.status);
        }
      } catch (e) {
        console.error('Dashboard: Error loading drives:', e);
        setDrives([]);
      }

      // 3. Load Applications from local system
      if (currentProfile && currentProfile.id) {
        try {
          const appRes = await fetch(`/api/applications?studentId=${currentProfile.id}`);
          if (appRes.ok) {
            const apps = await appRes.json();
            console.log('Dashboard: Applications loaded', apps);
            setApplications(Array.isArray(apps) ? apps : []);
          } else {
            console.error('Dashboard: Failed to fetch applications', appRes.status);
          }
        } catch (e) {
          console.error('Dashboard: Error loading applications:', e);
          setApplications([]);
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
    const studentCgpa = profile.cgpa ? parseFloat(profile.cgpa) : 0;
    if (studentCgpa >= drive.criteria.minCgpa) {
      reasons.push(`Eligible because CGPA ${studentCgpa} >= ${drive.criteria.minCgpa}`);
    } else {
      reasons.push(`Not eligible because CGPA ${studentCgpa} < ${drive.criteria.minCgpa}`);
      isEligible = false;
    }

    // Branch Check
    const studentBranch = profile.branch || 'Not Specified';
    if (drive.criteria.allowedBranches.includes(studentBranch)) {
      reasons.push(`Eligible because branch ${studentBranch} is allowed`);
    } else {
      reasons.push(`Not eligible because branch ${studentBranch} is not in allowed list (${drive.criteria.allowedBranches.join(', ')})`);
      isEligible = false;
    }

    // Backlog Check
    const studentBacklogs = profile.backlogs ? parseInt(profile.backlogs) : 0;
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
            <div className="flex space-x-2">
              {aiSuggestions && (
                <button 
                  onClick={() => toggleSpeech()}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
                    isSpeaking 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : 'bg-white text-blue-600 border-blue-200 hover:text-blue-800'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold">Stop</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.414 4.243 1 1 0 11-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.414-2.829 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold">Listen</span>
                    </>
                  )}
                </button>
              )}
              <button 
                onClick={() => fetchAISuggestions(profile)}
                disabled={loadingAI}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingAI ? 'Analyzing...' : 'Regenerate Suggestions'}
              </button>
            </div>
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
                Set your OPENROUTER_API_KEY in your .env.local file to see AI-powered placement suggestions!
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Placement Drives</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(drives) && drives.map(drive => {
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
                  [...applications]
                    .filter(a => a.status !== 'Applied')
                    .sort((a, b) => {
                      const dateA = new Date(a.updatedAt || a.appliedAt || 0).getTime();
                      const dateB = new Date(b.updatedAt || b.appliedAt || 0).getTime();
                      return dateB - dateA;
                    })
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
                              {new Date(app.updatedAt || app.appliedAt || 0).toLocaleDateString()}
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
