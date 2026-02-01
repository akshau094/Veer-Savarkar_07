'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { saveDrive, CompanyDrive } from '@/lib/mockData';

export default function CreateDrive() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    package: '',
    minCgpa: '7.0',
    maxBacklogs: '0',
    allowedBranches: [] as string[],
    requiredSkills: '',
  });

  const branches = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'];

  const handleBranchChange = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter(b => b !== branch)
        : [...prev.allowedBranches, branch]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDrive: CompanyDrive = {
      id: Date.now().toString(),
      name: formData.name,
      role: formData.role,
      package: formData.package,
      criteria: {
        minCgpa: parseFloat(formData.minCgpa),
        maxBacklogs: parseInt(formData.maxBacklogs),
        allowedBranches: formData.allowedBranches,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
      }
    };
    
    await saveDrive(newDrive);
    alert('Placement Drive Created Successfully!');
    router.push('/company');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Placement Drive</h3>
            <p className="mt-1 text-sm text-gray-500">Define your company's recruitment criteria.</p>

            <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Job Role</label>
                  <input
                    type="text"
                    name="role"
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="package" className="block text-sm font-medium text-gray-700">Package (LPA)</label>
                  <input
                    type="text"
                    name="package"
                    id="package"
                    placeholder="e.g. 12 LPA"
                    required
                    value={formData.package}
                    onChange={(e) => setFormData({...formData, package: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="minCgpa" className="block text-sm font-medium text-gray-700">Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    name="minCgpa"
                    id="minCgpa"
                    required
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({...formData, minCgpa: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="maxBacklogs" className="block text-sm font-medium text-gray-700">Max Backlogs Allowed</label>
                  <input
                    type="number"
                    name="maxBacklogs"
                    id="maxBacklogs"
                    required
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData({...formData, maxBacklogs: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Allowed Branches</label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {branches.map(branch => (
                      <label key={branch} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          checked={formData.allowedBranches.includes(branch)}
                          onChange={() => handleBranchChange(branch)}
                        />
                        <span className="ml-2 text-sm text-gray-600">{branch}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">Required Skills (Comma separated)</label>
                  <textarea
                    id="requiredSkills"
                    name="requiredSkills"
                    rows={3}
                    required
                    value={formData.requiredSkills}
                    onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                    placeholder="e.g. React, Node.js, Python"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
