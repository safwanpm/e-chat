'use client';

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

type UpdateProfileInput = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  profilePic?: string;
};

export default function Profile() {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    _id: authUser?._id || '',
    name: authUser?.name || '',
    email: authUser?.email || '',
    password: '',
    confirmPassword: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(authUser?.profilePic || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cloud_name', 'dh4xqnzmv');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dh4xqnzmv/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed. Please try again.');
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const { _id, name, email, password, confirmPassword, profilePic } = data;

      if (password && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const updateData = {
        _id,
        name,
        email,
        ...(password && { password }),
        ...(profilePic && { profilePic }),
      };

      await updateProfile(updateData);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      setSelectedImage(null);
      setIsUploadingImage(false);

      if (authUser?.profilePic) {
        setImagePreview(authUser.profilePic);
      }
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to update profile');
      setIsUploadingImage(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsUploadingImage(true);
      let profilePicUrl = authUser?.profilePic || '';

      if (selectedImage) {
        profilePicUrl = await uploadToCloudinary(selectedImage);
      }

      updateProfileMutation.mutate({
        ...formData,
        profilePic: profilePicUrl,
      });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Image upload failed');
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="font-Popins section bg-secondary h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="relative flex flex-row justify-center items-center w-auto md:w-1/2 mx-auto py-20 md:py-0">
        <div className="absolute top-2 md:top-20 left-0 md:left-10 flex flex-row gap-4">
          <Link className='text-primary text-2xl font-bold' href={'/home'}>Home</Link>
          <span className="font-extrabold text-primary text-2xl">/</span>
          <h1 className="font-bold text-primary text-2xl">Profile</h1>
        </div>
        <Image src="/image/chatting.png" alt="image" width={40} height={40} className="text-primary" />
        <h2 className="font-extrabold text-4xl md:text-6xl text-primary">EChat</h2>
      </div>

      {/* Form Section */}
      <div className="flex-col justify-center items-center mx-6 md:mx-20 w-auto md:w-1/4 my-auto space-y-8">
        <h2 className="text-primary font-extrabold text-center text-2xl md:text-4xl">Profile</h2>

        <div className="flex justify-center text-center py-2">
          <div className="relative group">
            <Image
              src={imagePreview}
              alt="profile"
              width={80}
              height={80}
              className="rounded-full border border-secondary object-cover cursor-pointer transition-opacity group-hover:opacity-80"
              onClick={() => fileInputRef.current?.click()}
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingImage ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isUploadingImage || updateProfileMutation.isPending}
            />
          </div>
        </div>

        {isUploadingImage && (
          <div className="text-center">
            <p className="text-primary text-sm">Uploading image...</p>
          </div>
        )}

        {selectedImage && !isUploadingImage && (
          <div className="text-center">
            <p className="text-primary text-sm">New image selected: {selectedImage.name}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(authUser?.profilePic || '');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-red-500 text-sm underline mt-1"
            >
              Remove
            </button>
          </div>
        )}

        <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-white p-4 text-black rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-white p-4 text-black rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="bg-white p-4 text-black rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="New Password (optional)"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="bg-white p-4 text-black rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Confirm Password"
          />
          <button
            type="submit"
            disabled={updateProfileMutation.isPending || isUpdatingProfile || isUploadingImage}
            className="bg-primary p-4 rounded-3xl text-white font-extrabold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingImage
              ? 'Uploading Image...'
              : updateProfileMutation.isPending || isUpdatingProfile
              ? 'Updating...'
              : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
