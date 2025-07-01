'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGoogle, FaFacebookF, FaSpinner } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation';

interface AuthUser {
  
  email: string;
  password: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true);

  const router = useRouter();
  const { login, authUser, isLoggingIn } = useAuthStore();

  // Redirect if already logged in

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSkeletonLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(email)) errors.email = 'Enter a valid email address';

    if (!password.trim()) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    return errors;
  };

  const mutation = useMutation({
  mutationFn: async ({ email, password }: AuthUser) => {
    return await login({ email, password });
  },
  onSuccess: () => {
    toast.success('Login successful!');
    router.push('/home'); 
  },
  onError: (error: any) => {
    toast.error(error.message || 'Login failed');
  },
});


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      mutation.mutate({ email, password });
    }
  };

  const SkeletonBox = ({ height }: { height: string }) => (
    <div className="w-full bg-gray-300 rounded-3xl animate-pulse" style={{ height }} />
  );

  return (
    <div className="font-poppins section bg-secondary min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="flex justify-center items-center w-full md:w-1/2 p-10">
        {isSkeletonLoading ? (
          <div className="flex items-center space-x-3">
            <SkeletonBox height="40px" />
            <SkeletonBox height="50px" />
          </div>
        ) : (
          <>
            <img src="/image/chatting.png" alt="Chatting Icon" className="w-10 h-10 mr-2" />
            <h2 className="font-extrabold text-4xl md:text-6xl text-primary">EChat</h2>
          </>
        )}
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 py-8">
        <div className="w-full max-w-md space-y-6">
          {isSkeletonLoading ? (
            <>
              <SkeletonBox height="40px" />
              <div className="flex gap-10 py-4 w-full justify-center">
                <SkeletonBox height="40px" />
                <SkeletonBox height="40px" />
              </div>
              <SkeletonBox height="50px" />
              <SkeletonBox height="50px" />
              <SkeletonBox height="50px" />
              <SkeletonBox height="20px" />
            </>
          ) : (
            <>
              <h2 className="text-primary font-extrabold text-3xl md:text-4xl text-center">Login</h2>

              <div className="flex justify-center gap-10 py-4 text-xl text-primary">
                <button type="button"><FaGoogle /></button>
                <button type="button"><FaFacebookF /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-4">
                <div className="flex flex-col space-y-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white p-4 rounded-3xl text-black"
                    placeholder="Email"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="flex flex-col space-y-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white p-4 rounded-3xl text-black"
                    placeholder="Password"
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  className="bg-primary p-4 rounded-3xl text-white font-extrabold flex justify-center items-center"
                  disabled={mutation.isPending || isLoggingIn}
                >
                  {(mutation.isPending || isLoggingIn)
                    ? <FaSpinner className="animate-spin text-xl" />
                    : 'Submit'}
                </button>
              </form>

              <p className="text-center text-black font-bold">
                Don't have an account?{' '}
                <Link href="/signUp" className="font-extrabold text-primary">Sign Up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
