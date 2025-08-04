'use client'

import { Fragment } from 'react'
import Link from 'next/link'

interface SignupCTAModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignupCTAModal({ isOpen, onClose }: SignupCTAModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl transform transition-all">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-2">
              You've Used Your Free Try!
            </h3>
            <p className="text-gray-600">
              Sign up for a free account to continue analyzing your text
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Free Account Benefits:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong>2 free analyses per month</strong> - Perfect for occasional use
                </span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong>Save your analysis history</strong> - Track your writing progress
                </span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong>Upgrade anytime</strong> - Get unlimited analyses for $4/month
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-sm"
            >
              Sign Up Free - No Credit Card Required
            </Link>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <Link
              href="/login"
              className="block w-full bg-white text-purple-600 text-center py-3 px-4 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              Log In
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-purple-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}