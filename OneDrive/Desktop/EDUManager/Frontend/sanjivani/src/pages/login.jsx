import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: id, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid ID or password');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on user role
      if (data.user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/dashboard');
      }
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

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/create-account" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
            Create Account
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

export default Login;
