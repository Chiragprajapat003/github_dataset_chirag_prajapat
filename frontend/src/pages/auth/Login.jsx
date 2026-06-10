import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { login, clearError } from '../../store/slices/authSlice';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  
  const from = location.state?.from?.pathname || '/dashboard';
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired') === 'true';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      dispatch(clearError());
      const result = await dispatch(login(values));
      if (login.fulfilled.match(result)) {
        navigate(from, { replace: true });
      }
    },
  });

  // Autofill helpers for easier evaluation
  const setDemoCredentials = (role) => {
    formik.setFieldValue('email', role === 'admin' ? 'admin@example.com' : 'chirag@example.com');
    formik.setFieldValue('password', 'password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Dynamic background glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-500/10 rounded-xl mb-4 border border-primary-500/25">
            <Lock className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-slate-400 text-sm">Sign in to manage your Git DataHub</p>
        </div>

        {sessionExpired && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
            Your session has expired. Please login again.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border text-slate-100 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500/30'
                }`}
                placeholder="you@example.com"
                {...formik.getFieldProps('email')}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-400 text-xs mt-1 block">{formik.errors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border text-slate-100 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500/30'
                }`}
                placeholder="••••••••"
                {...formik.getFieldProps('password')}
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <span className="text-red-400 text-xs mt-1 block">{formik.errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-750 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick login buttons */}
        <div className="mt-6 border-t border-slate-700/50 pt-5 text-center">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">Quick Login (Testing)</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDemoCredentials('user')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-750 border border-slate-700/80 rounded-lg text-xs text-slate-300 font-semibold transition-colors"
            >
              Demo User
            </button>
            <button
              onClick={() => setDemoCredentials('admin')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-750 border border-slate-700/80 rounded-lg text-xs text-slate-300 font-semibold transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-450 hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
