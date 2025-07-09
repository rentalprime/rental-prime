import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
  RiSaveLine, 
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiUploadCloud2Line
} from 'react-icons/ri';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar: null,
    bio: ''
  });

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Super Admin',
        avatar: user.avatar || null,
        bio: user.bio || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // In a real app, this would call an API endpoint to update the profile
      // For now, simulating with a timeout
      setTimeout(() => {
        // In a real application, you would use:
        // await updateUserProfile(profileData);
        
        toast.success('Profile updated successfully');
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Check if passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      setSaving(false);
      return;
    }

    try {
      // In a real app, this would call an API endpoint to change the password
      // For now, simulating with a timeout
      setTimeout(() => {
        toast.success('Password changed successfully');
        
        // Reset password fields
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        // Close password section
        setShowPasswordSection(false);
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to a server and get back a URL
      // For now, create a local object URL
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
      toast.success('Profile picture updated');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Avatar and Quick Info */}
        <div className="card-glass lg:col-span-1">
          <div className="flex flex-col items-center p-6">
            <div className="relative mb-6">
              <div className="w-32 h-32 overflow-hidden bg-gray-200 rounded-full">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${profileData.name}&size=128&background=0D8ABC&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer shadow-lg border-2 border-white">
                <RiUploadCloud2Line className="w-5 h-5 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800">{profileData.name}</h2>
            <p className="text-gray-500 mb-4">{profileData.role}</p>
            
            <div className="w-full border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center mb-3">
                <RiMailLine className="text-gray-500 mr-2" />
                <span className="text-gray-600">{profileData.email}</span>
              </div>
              {profileData.phone && (
                <div className="flex items-center">
                  <RiPhoneLine className="text-gray-500 mr-2" />
                  <span className="text-gray-600">{profileData.phone}</span>
                </div>
              )}
            </div>
            
            <button
              type="button"
              className="mt-6 btn-outline w-full flex items-center justify-center"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <RiLockPasswordLine className="mr-2" />
              {showPasswordSection ? 'Hide Password Form' : 'Change Password'}
            </button>
          </div>
        </div>
        
        {/* Right column - Profile Form */}
        <div className="card-glass lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h2>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiUserLine className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiMailLine className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="input pl-10"
                      required
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiPhoneLine className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-10 pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="input pl-16"
                      placeholder="99XXXXX999"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      title="Please enter a valid 10-digit Indian phone number"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter 10-digit number without country code</p>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={profileData.role}
                    className="input"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Role cannot be changed</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className="input"
                  rows="3"
                  placeholder="Tell us a little about yourself"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <RiSaveLine className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Password Change Form */}
        {showPasswordSection && (
          <div className="card-glass lg:col-span-3">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="input"
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="input"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <RiLockPasswordLine className="mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
