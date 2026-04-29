import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="relative mb-8">
                <h1 className="text-9xl font-bold text-gray-100 dark:text-gray-800">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-indigo-600 text-white px-4 py-1 rounded rotate-12 font-bold shadow-lg">
                        Page Not Found
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Lost in the Pipeline?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Oops! The page you're looking for doesn't exist. It might have been moved, or maybe that job offer just expired.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-200 dark:shadow-none transform hover:-translate-y-0.5"
                >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                </button>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
    );
};
