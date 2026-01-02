"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Package, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Reset link sent to your email");
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center mx-auto">
            <Image
              src="/logo.png"
              alt="SwiftTrack Logo"
              width={200} // Increased from 160
              height={50} // Increased from 40
              className="h-auto w-auto max-h-12" // max-h-12 ensures it doesn't get too tall
              priority
            />
          </Link>

          {!sent ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                Enter your email to receive a reset link
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                We've sent a password reset link to your email
              </p>
            </>
          )}
        </div>

        {!sent ? (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="card text-center">
            <div className="space-y-6">
              <div className="text-left bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-600">
                  <span className="font-semibold">What to do next:</span>
                </p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2" />
                    Check your inbox at <strong>{email}</strong>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2" />
                    Click the password reset link in the email
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2" />
                    Create a new password for your account
                  </li>
                </ul>
              </div>

              <div className="text-sm text-gray-500">
                <p>Didn't receive the email? Check your spam folder or</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-primary-600 hover:text-primary-700 font-medium mt-2"
                >
                  try another email address
                </button>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Sign In
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            Need help?{" "}
            <Link href="/contact" className="text-primary-600 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
