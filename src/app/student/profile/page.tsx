'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function StudentProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cgpa: '',
    branch: '',
    skills: '',
    year: '',
    backlogs: '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For a real hackathon, you'd upload the PDF to a server or base64 it.
      // Here we'll simulate saving the filename for local persistence.
      const updatedProfile = {
        ...formData,
        id: 's1',
        name: 'Akash Kumar',
        resumeName: 'resume.pdf'
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });

      if (res.ok) {
        localStorage.setItem('studentProfile', JSON.stringify(updatedProfile));
        alert('Profile saved locally on system!');
        router.push('/student/dashboard');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Student Profile Setup</h3>
            <p className="mt-1 text-sm text-gray-500">Please provide your academic and professional details.</p>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                
                <div className="sm:col-span-3">
                  <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgpa"
                    id="cgpa"
                    required
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                  <select
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics</option>
                    <option value="MECH">Mechanical</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="backlogs" className="block text-sm font-medium text-gray-700">Current Backlogs</label>
                  <input
                    type="number"
                    name="backlogs"
                    id="backlogs"
                    required
                    value={formData.backlogs}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (Comma separated)</label>
                  <textarea
                    id="skills"
                    name="skills"
                    rows={3}
                    required
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, Python, AWS"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
