import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Campus Placement <span className="text-blue-600">Portal</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your recruitment process. Intelligent eligibility tracking and seamless applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">For Students</h3>
              <p className="mt-2 text-sm text-gray-500">
                View upcoming drives, check your eligibility with detailed reasons, and track your application status.
              </p>
              <div className="mt-5">
                <Link
                  href="/student"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Enter Student Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">For Companies</h3>
              <p className="mt-2 text-sm text-gray-500">
                Define eligibility criteria, browse eligible candidates, and manage selection rounds with ease.
              </p>
              <div className="mt-5">
                <Link
                  href="/company"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Enter Company Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
