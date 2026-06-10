import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateProfile, changePassword } from '../../store/slices/authSlice';
import { User, Lock, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Formik for profile info
  const infoForm = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(updateProfile({ name: values.name }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.payload || 'Failed to update profile.');
      }
    },
  });

  // Formik for password change
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }));
      if (changePassword.fulfilled.match(result)) {
        toast.success('Password changed successfully!');
        resetForm();
      } else {
        toast.error(result.payload || 'Failed to change password.');
      }
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-github-lightText dark:text-white tracking-tight">My Profile</h2>
        <p className="text-sm text-github-lightTextMuted dark:text-github-textMuted">Manage your credentials, login details, and security passwords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 md:p-8 rounded-lg shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-github-lightText dark:text-white uppercase tracking-wider">Account Details</h3>
            <p className="text-xs text-github-lightTextMuted dark:text-github-textMuted mt-0.5">Your general account name and system credentials.</p>
          </div>

          <form onSubmit={infoForm.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-github-lightTextMuted dark:text-github-textMuted">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  {...infoForm.getFieldProps('name')}
                />
              </div>
              {infoForm.touched.name && infoForm.errors.name && (
                <span className="text-red-500 text-xs mt-1 block font-bold">{infoForm.errors.name}</span>
              )}
            </div>

            <div>
              <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Email (Read Only)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-github-lightTextMuted dark:text-github-textMuted">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  disabled
                  className="w-full pl-10 pr-4 py-2 bg-github-lightBgSecondary dark:bg-github-bgHeader border border-github-lightBorder dark:border-github-border text-github-lightTextMuted dark:text-github-textMuted rounded-lg text-sm opacity-70 cursor-not-allowed"
                  value={user?.email || ''}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-github-green hover:bg-github-greenHover text-white border border-black/15 dark:border-white/10 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Update Details
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 md:p-8 rounded-lg shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-github-lightText dark:text-white uppercase tracking-wider">Security Settings</h3>
            <p className="text-xs text-github-lightTextMuted dark:text-github-textMuted mt-0.5">Change your login password. We recommend a safe, unique option.</p>
          </div>

          <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-github-lightTextMuted dark:text-github-textMuted">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="currentPassword"
                  type="password"
                  className="w-full pl-10 pr-4 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  placeholder="••••••••"
                  {...passwordForm.getFieldProps('currentPassword')}
                />
              </div>
              {passwordForm.touched.currentPassword && passwordForm.errors.currentPassword && (
                <span className="text-red-500 text-xs mt-1 block font-bold">{passwordForm.errors.currentPassword}</span>
              )}
            </div>

            <div>
              <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-github-lightTextMuted dark:text-github-textMuted">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="newPassword"
                  type="password"
                  className="w-full pl-10 pr-4 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  placeholder="Min. 8 characters"
                  {...passwordForm.getFieldProps('newPassword')}
                />
              </div>
              {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                <span className="text-red-500 text-xs mt-1 block font-bold">{passwordForm.errors.newPassword}</span>
              )}
            </div>

            <div>
              <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-github-lightTextMuted dark:text-github-textMuted">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full pl-10 pr-4 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  placeholder="Confirm new password"
                  {...passwordForm.getFieldProps('confirmPassword')}
                />
              </div>
              {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && (
                <span className="text-red-500 text-xs mt-1 block font-bold">{passwordForm.errors.confirmPassword}</span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-github-green hover:bg-github-greenHover text-white border border-black/15 dark:border-white/10 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
