'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/axiosInstance';

type SignUpFormInputs = {
  email: string;
  username: string;
  password: string;
  image: FileList;  // for file input
};

const SignUp: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const router = useRouter();

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('username', data.username);
      formData.append('password', data.password);
      if (data.image && data.image.length > 0) {
        formData.append('file', data.image[0]);
      }

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/signup`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log(response.data)
      localStorage.setItem('user', response.data);
      localStorage.setItem('token', response.data.accessToken);

      toast.success('Signup successful! Redirecting...', {
        position: 'top-right',
        autoClose: 2000,
        theme: 'colored',
      });

      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.title ||
        'Invalid credentials. Please check your details.';

      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-4">
      <div className="relative z-10 w-full max-w-md">
        <div
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20 transition-all duration-500 hover:shadow-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-center relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 transition-opacity duration-500 ${
                isHovered ? 'opacity-20' : ''
              }`}
            />
            <h1 className="text-3xl font-bold text-white relative z-10">Create Account</h1>
            <p className="text-white/90 mt-2 relative z-10">Sign up to get started</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
              {/* Profile Image */}
              {/* Profile Image */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-white/80">Profile Image</label>
  <input
    type="file"
    accept="image/*"
    {...register('image', {
      required: 'Profile image is required',
      validate: {
        isImage: (files) =>
          files && files.length > 0 && files[0].type.startsWith('image/')
            ? true
            : 'Only image files are allowed',
      },
    })}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
      }
    }}
    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none transition-all"
  />
  {previewImage && (
    <img
      src={previewImage}
      alt="Preview"
      className="mt-2 w-24 h-24 object-cover rounded-full border-2 border-purple-500"
    />
  )}
  {errors.image && (
    <p className="text-pink-400 text-xs mt-1 animate-fadeIn">{errors.image.message}</p>
  )}
</div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">Email</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-pink-400 text-xs mt-1 animate-fadeIn">{errors.email.message}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">Username</label>
                <input
                  type="text"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' },
                  })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-pink-400 text-xs mt-1 animate-fadeIn">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-white/70 hover:text-white"
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-pink-400 text-xs mt-1 animate-fadeIn">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 inline-block text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing up...
                    </>
                  ) : (
                    'Sign up'
                  )}
                </button>
              </div>

              {/* Already have account */}
              <div className="text-center text-sm text-white/80">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
