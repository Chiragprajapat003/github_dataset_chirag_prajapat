import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { register, clearError } from '../../store/slices/authSlice';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'user', // Default role
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      role: Yup.string().oneOf(['user', 'admin'], 'Invalid role').required('Role is required'),
    }),
    onSubmit: async (values) => {
      dispatch(clearError());
      const result = await dispatch(register(values));
      if (register.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-500/10 rounded-xl mb-4 border border-primary-500/25">
            <User className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="mt-2 text-slate-400 text-sm">Join Git DataHub to manage your dataset collections</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border text-slate-100 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                  formik.touched.name && formik.errors.name
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500/30'
                }`}
                placeholder="John Doe"
                {...formik.getFieldProps('name')}
              />
            </div>
            {formik.touched.name && formik.errors.name && (
              <span className="text-red-400 text-xs mt-1 block">{formik.errors.name}</span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
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
            <label className="block text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Password</label>
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

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Account Role</label>
            <select
              id="role"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/30"
              {...formik.getFieldProps('role')}
            >
              <option value="user">Standard User</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-750 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-450 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
