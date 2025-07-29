import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          loginId: id,
          password,
          role: 'teacher',
        }),
      });
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error('Server error: Invalid JSON response');
        }
      }
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            EDUManager
          </div>
          <div className="text-sm text-gray-500 tracking-wider">
            EDUCATION MANAGEMENT SYSTEM
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        )}
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Mobile Number</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-700 font-medium">ID Number</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your ID number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
            Sign In
          </Link>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            © 2024 EDUManager. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount; 