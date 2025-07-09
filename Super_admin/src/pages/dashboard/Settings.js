import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RiSaveLine, 
  RiGlobalLine, 
  RiMailLine, 
  RiLockPasswordLine,
  RiUploadCloud2Line,
  RiImageAddLine,
  RiUserSettingsLine,
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine
} from 'react-icons/ri';
import roleService from '../../services/roleService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Role Management State
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState('add'); // 'add' or 'edit'
  const [currentRole, setCurrentRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    phoneNumber: '',
    address: '',
    logo: null,
    favicon: null,
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kolkata'
  });
  
  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    senderName: '',
    senderEmail: '',
    enableEmailNotifications: true
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    loginAttempts: '5',
    lockoutTime: '30',
    passwordExpiry: '90',
    minimumPasswordLength: '8',
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true
  });

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setRolesLoading(false);
    }
  };

  // Handle role form input changes
  const handleRoleChange = (e) => {
    setRoleFormData({
      ...roleFormData,
      [e.target.name]: e.target.value
    });
  };

  // Open modal for adding a new role
  const openAddRoleModal = () => {
    setRoleModalMode('add');
    setRoleFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setShowRoleModal(true);
  };

  // Open modal for editing a role
  const openEditRoleModal = (role) => {
    setRoleModalMode('edit');
    setCurrentRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      status: role.status || 'active'
    });
    setShowRoleModal(true);
  };

  // Handle role form submission
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (roleModalMode === 'add') {
        // Create a new role
        const newRole = await roleService.createRole(roleFormData);
        setRoles([newRole, ...roles]);
        toast.success('Role added successfully');
      } else if (roleModalMode === 'edit' && currentRole) {
        // Update an existing role
        const updatedRole = await roleService.updateRole(currentRole.id, roleFormData);
        const updatedRoles = roles.map(role => 
          role.id === currentRole.id ? updatedRole : role
        );
        
        setRoles(updatedRoles);
        toast.success('Role updated successfully');
      }
      
      setShowRoleModal(false);
    } catch (error) {
      console.error('Error submitting role form:', error);
      toast.error(error.message || 'An error occurred');
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(roleId);
        setRoles(roles.filter(role => role.id !== roleId));
        toast.success('Role deleted successfully');
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role. It may be assigned to users.');
      }
    }
  };

  // Filter roles based on search term
  const filteredRoles = searchTerm
    ? roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : roles;
  
  // Fetch settings on component mount
  useEffect(() => {
    // In a real application, this would fetch from the API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      setGeneralSettings({
        siteName: 'Rental Prima',
        siteDescription: 'India\'s premium rental property platform',
        contactEmail: 'contact@rentalprima.in',
        phoneNumber: '9826012345',
        address: '42, MG Road, Koramangala, Bengaluru, Karnataka 560034',
        logo: null,
        favicon: null,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Asia/Kolkata'
      });
      
      setEmailSettings({
        smtpHost: 'smtp.rentalprima.in',
        smtpPort: '587',
        smtpUsername: 'notifications@rentalprima.in',
        smtpPassword: 'password123',
        smtpEncryption: 'tls',
        senderName: 'Rental Prima India',
        senderEmail: 'notifications@rentalprima.in',
        enableEmailNotifications: true
      });
      
      setSecuritySettings({
        enableTwoFactor: true,  // Enable two-factor for better security (common in Indian financial apps)
        loginAttempts: '3',     // Stricter login attempts for better security
        lockoutTime: '15',      // Shorter lockout time (in minutes)
        passwordExpiry: '60',    // More frequent password resets (in days)
        minimumPasswordLength: '8',
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true
      });
      
      setLoading(false);
    }, 1000);
    
    // Fetch roles
    fetchRoles();
  }, []);

  // Handle general settings changes
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle email settings changes
  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle security settings changes
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // In a real application, this would send to the API
    // For demo purposes, we'll simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setSaving(false);
    }, 1500);
  };

  // Handle file upload
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // For demo purposes, we'll just update the state
      setGeneralSettings({
        ...generalSettings,
        [field]: URL.createObjectURL(file)
      });
      toast.success(`${field === 'logo' ? 'Logo' : 'Favicon'} updated`);
    }
  };

  // Test email connection
  const testEmailConnection = () => {
    toast.loading('Testing email connection...');
    
    // In a real application, this would send a test email
    // For demo purposes, we'll simulate the API call
    setTimeout(() => {
      toast.dismiss();
      toast.success('Email connection successful!');
    }, 2000);
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
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
      </div>

      <div className="card-glass">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('general')}
          >
            <RiGlobalLine className="inline-block mr-2" />
            General
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <RiMailLine className="inline-block mr-2" />
            Email
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <RiLockPasswordLine className="inline-block mr-2" />
            Security
          </button>

        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={generalSettings.phoneNumber}
                    onChange={handleGeneralChange}
                    className="input pl-12"
                    placeholder="99XXXXX999"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Please enter a valid 10-digit Indian phone number"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter 10-digit number without country code</p>
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralChange}
                  className="input"
                >
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  name="dateFormat"
                  value={generalSettings.dateFormat}
                  onChange={handleGeneralChange}
                  className="input"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Format)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  id="timeZone"
                  name="timeZone"
                  value={generalSettings.timeZone}
                  onChange={handleGeneralChange}
                  className="input"
                >
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Colombo">Sri Lanka</option>
                  <option value="Asia/Dhaka">Bangladesh</option>
                  <option value="Asia/Kathmandu">Nepal</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Asia/Singapore">Singapore</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  className="input"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  className="input"
                  rows="3"
                  placeholder="Street Address, City, State, PIN Code"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Please include PIN code for delivery purposes</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4 flex items-center justify-center">
                    {generalSettings.logo ? (
                      <img src={generalSettings.logo} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <RiImageAddLine className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="btn-outline cursor-pointer">
                    <RiUploadCloud2Line className="mr-2" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon
                </label>
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4 flex items-center justify-center">
                    {generalSettings.favicon ? (
                      <img src={generalSettings.favicon} alt="Favicon" className="h-full w-full object-contain" />
                    ) : (
                      <RiImageAddLine className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="btn-outline cursor-pointer">
                    <RiUploadCloud2Line className="mr-2" />
                    Upload Favicon
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                    />
                  </label>
                </div>
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
                    <RiSaveLine className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="text"
                  id="smtpPort"
                  name="smtpPort"
                  value={emailSettings.smtpPort}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  id="smtpUsername"
                  name="smtpUsername"
                  value={emailSettings.smtpUsername}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  name="smtpPassword"
                  value={emailSettings.smtpPassword}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700 mb-1">
                  Encryption
                </label>
                <select
                  id="smtpEncryption"
                  name="smtpEncryption"
                  value={emailSettings.smtpEncryption}
                  onChange={handleEmailChange}
                  className="input"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={emailSettings.senderName}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={emailSettings.senderEmail}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEmailNotifications"
                    name="enableEmailNotifications"
                    checked={emailSettings.enableEmailNotifications}
                    onChange={handleEmailChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-700">
                    Enable Email Notifications
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                className="btn-outline flex items-center"
                onClick={testEmailConnection}
              >
                Test Connection
              </button>
              
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
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}


        
        {/* Security Settings */}
        {activeTab === 'security' && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    name="enableTwoFactor"
                    checked={securitySettings.enableTwoFactor}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-700">
                    Enable Two-Factor Authentication for Admin Users
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="loginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  id="loginAttempts"
                  name="loginAttempts"
                  value={securitySettings.loginAttempts}
                  onChange={handleSecurityChange}
                  className="input"
                  min="1"
                  max="10"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lockoutTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Lockout Time (minutes)
                </label>
                <input
                  type="number"
                  id="lockoutTime"
                  name="lockoutTime"
                  value={securitySettings.lockoutTime}
                  onChange={handleSecurityChange}
                  className="input"
                  min="5"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  id="passwordExpiry"
                  name="passwordExpiry"
                  value={securitySettings.passwordExpiry}
                  onChange={handleSecurityChange}
                  className="input"
                  min="0"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Set to 0 for no expiry</p>
              </div>
              
              <div>
                <label htmlFor="minimumPasswordLength" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  id="minimumPasswordLength"
                  name="minimumPasswordLength"
                  value={securitySettings.minimumPasswordLength}
                  onChange={handleSecurityChange}
                  className="input"
                  min="6"
                  max="32"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireSpecialChars"
                      name="requireSpecialChars"
                      checked={securitySettings.requireSpecialChars}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-700">
                      Require special characters
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireNumbers"
                      name="requireNumbers"
                      checked={securitySettings.requireNumbers}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-700">
                      Require numbers
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireUppercase"
                      name="requireUppercase"
                      checked={securitySettings.requireUppercase}
                      onChange={handleSecurityChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-700">
                      Require uppercase letters
                    </label>
                  </div>
                </div>
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
                    <RiSaveLine className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
