'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Loader2,
  Palette,
  Save,
  Shield,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
// Import Gradian UI form components
import { Switch } from '@/gradian-ui/form-builder/form-elements/components/Switch';
import { Label } from '@/gradian-ui/form-builder/form-elements/components/Label';
import { EmailInput } from '@/gradian-ui/form-builder/form-elements/components/EmailInput';
import { NumberInput } from '@/gradian-ui/form-builder/form-elements/components/NumberInput';
import { PasswordInput } from '@/gradian-ui/form-builder/form-elements/components/PasswordInput';
import { PhoneInput } from '@/gradian-ui/form-builder/form-elements/components/PhoneInput';
import { Select } from '@/gradian-ui/form-builder/form-elements/components/Select';
import { TextInput } from '@/gradian-ui/form-builder/form-elements/components/TextInput';
// Import settings domain
import { useSettings, SettingsUpdate } from '@/domains/settings';
// Import user store
import { useUserStore } from '@/stores/user.store';

export default function SettingsPage() {
  // Settings now get userId from JWT token automatically
  const { settings, loading, error, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [localSettings, setLocalSettings] = useState<SettingsUpdate | null>(null);
  const [userData, setUserData] = useState<{ name: string; lastname?: string; email: string; avatar?: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    step: 'idle' as 'idle' | 'qr' | 'verify' | 'backup',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Gradian%20SCM:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Gradian%20SCM',
    secretKey: 'JBSWY3DPEHPK3PXP',
    backupCodes: [] as string[],
    verificationCode: '',
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get userId from store to fetch user data
        const userId = useUserStore.getState().getUserId();
        if (userId) {
          const response = await fetch(`/api/data/users/${userId}`, {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setUserData({
                name: result.data.name || '',
                lastname: result.data.lastname || '',
                email: result.data.email || '',
                avatar: result.data.avatar || result.data.avatarUrl || '',
              });
              setAvatarUrl(result.data.avatar || result.data.avatarUrl || '');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  // Initialize local settings from loaded settings
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        profile: { ...settings.profile },
        notifications: { ...settings.notifications },
        security: { ...settings.security, currentPassword: '' },
        appearance: { ...settings.appearance },
      });
    }
  }, [settings]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = async () => {
    if (!localSettings || !settings) return;
    
    try {
      // Get userId to update user avatar
      const userId = useUserStore.getState().getUserId();
      
      // Update user avatar if it changed
      if (userId && avatarUrl !== (userData?.avatar || '')) {
        try {
          const userResponse = await fetch(`/api/data/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              avatar: avatarUrl,
            }),
          });

          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (userResult.success && userResult.data) {
              setUserData(prev => ({
                ...prev!,
                avatar: userResult.data.avatar || userResult.data.avatarUrl || '',
              }));
            }
          }
        } catch (err) {
          console.error('Error updating avatar:', err);
        }
      }
      
      // Prepare updates - only include changed fields
      // Note: name, lastname, email are not updatable from settings
      const updates: SettingsUpdate = {};
      
      // Only include editable profile fields (not name, email - these are read-only)
      if (localSettings.profile) {
        const profileUpdate: any = { ...localSettings.profile };
        // Remove name, email - these are read-only
        delete profileUpdate.name;
        delete profileUpdate.email;
        // Only include if there are other fields to update
        if (Object.keys(profileUpdate).length > 0) {
          updates.profile = profileUpdate;
        }
      }
      if (localSettings.notifications) {
        updates.notifications = localSettings.notifications;
      }
      if (localSettings.security) {
        // Don't save currentPassword in settings
        const { currentPassword, ...securityWithoutPassword } = localSettings.security;
        updates.security = securityWithoutPassword;
      }
      if (localSettings.appearance) {
        updates.appearance = localSettings.appearance;
      }
      
      const updatedSettings = await updateSettings(updates);
      
      // Update local settings with the returned settings (which include defaults merged)
      if (updatedSettings) {
        setLocalSettings({
          profile: { ...updatedSettings.profile },
          notifications: { ...updatedSettings.notifications },
          security: { ...updatedSettings.security, currentPassword: '' },
          appearance: { ...updatedSettings.appearance },
        });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordLoading(true);

    try {
      // Validate passwords
      if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
        setPasswordError('All password fields are required');
        setPasswordLoading(false);
        return;
      }

      if (passwordChange.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        setPasswordLoading(false);
        return;
      }

      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        setPasswordError('New passwords do not match');
        setPasswordLoading(false);
        return;
      }

      // Call password change API
      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setPasswordError(result.error || 'Failed to change password');
        setPasswordLoading(false);
        return;
      }

      // Success - clear password fields
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError(null);
      alert('Password changed successfully!');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });
    return codes;
  };

  const handleEnable2FA = () => {
    if (!localSettings || !settings) return;
    
    if (!localSettings.security?.twoFactorAuth) {
      // Generate backup codes
      const codes = generateBackupCodes();
      setTwoFactorSetup({
        ...twoFactorSetup,
        step: 'qr',
        backupCodes: codes,
      });
    } else {
      // Disable 2FA
      setLocalSettings(prev => ({
        ...prev,
        security: { ...prev?.security || settings.security, twoFactorAuth: false }
      }));
      setTwoFactorSetup({
        step: 'idle',
        qrCode: '',
        secretKey: '',
        backupCodes: [],
        verificationCode: '',
      });
    }
  };

  const handleVerify2FA = () => {
    if (!localSettings || !settings) return;
    
    // In a real app, this would verify the code with the backend
    if (twoFactorSetup.verificationCode.length === 6) {
      setLocalSettings(prev => ({
        ...prev,
        security: { ...prev?.security || settings.security, twoFactorAuth: true }
      }));
      setTwoFactorSetup({
        ...twoFactorSetup,
        step: 'backup',
      });
    }
  };

  const handleContinueFromBackup = () => {
    setTwoFactorSetup({
      ...twoFactorSetup,
      step: 'idle',
    });
  };

  const handleRegenerateBackupCodes = () => {
    const codes = generateBackupCodes();
    setTwoFactorSetup({
      ...twoFactorSetup,
      backupCodes: codes,
    });
  };


  if (loading) {
    return (
      <MainLayout title="Settings">
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Settings">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </MainLayout>
    );
  }

  if (!settings || !localSettings) {
    return (
      <MainLayout title="Settings">
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600">No settings found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeTab === tab.id ? 'bg-violet-50 text-violet-600 border-r-2 border-violet-600' : 'text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      config={{
                        name: 'name',
                        label: 'First Name',
                        type: 'text',
                        placeholder: 'First name'
                      }}
                      value={userData?.name || ''}
                      onChange={() => {}} // Disabled - read-only
                      disabled={true}
                    />
                    <TextInput
                      config={{
                        name: 'lastname',
                        label: 'Last Name',
                        type: 'text',
                        placeholder: 'Last name'
                      }}
                      value={userData?.lastname || ''}
                      onChange={() => {}} // Disabled - read-only
                      disabled={true}
                      />
                    <EmailInput
                      config={{
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        placeholder: 'Email address'
                      }}
                      value={userData?.email || ''}
                      onChange={() => {}} // Disabled - read-only
                      disabled={true}
                      />
                    <TextInput
                      config={{
                        name: 'avatar',
                        label: 'Avatar URL',
                        type: 'url',
                        placeholder: 'Enter avatar image URL'
                      }}
                      value={avatarUrl}
                      onChange={(value: string) => setAvatarUrl(value)}
                    />
                    <TextInput
                      config={{
                        name: 'role',
                        label: 'Role',
                        type: 'text',
                        placeholder: 'Enter your role'
                      }}
                        value={localSettings?.profile?.role || ''}
                      onChange={(value: string) => setLocalSettings(prev => ({
                          ...prev,
                        profile: { ...prev?.profile || settings.profile, role: value }
                        }))}
                      />
                    <TextInput
                      config={{
                        name: 'department',
                        label: 'Department',
                        type: 'text',
                        placeholder: 'Enter your department'
                      }}
                        value={localSettings?.profile?.department || ''}
                      onChange={(value: string) => setLocalSettings(prev => ({
                          ...prev,
                        profile: { ...prev?.profile || settings.profile, department: value }
                        }))}
                      />
                    <PhoneInput
                      config={{
                        name: 'phone',
                        label: 'Phone',
                        type: 'tel',
                        placeholder: 'Enter your phone number'
                      }}
                        value={localSettings?.profile?.phone || ''}
                      onChange={(value: string) => setLocalSettings(prev => ({
                          ...prev,
                        profile: { ...prev?.profile || settings.profile, phone: value }
                        }))}
                      />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                                    {/* Communication Channels */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Communication Channels</Label>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200 mt-4">
                       <Switch
                         config={{
                           name: 'emailNotifications',
                           label: 'Email Notifications - Receive notifications via email',
                           type: 'switch'
                         }}
                         value={localSettings?.notifications?.emailNotifications ?? true}
                         onChange={(checked: boolean) => setLocalSettings(prev => ({
                          ...prev,
                           notifications: { ...prev?.notifications || settings.notifications, emailNotifications: checked }
                        }))}
                      />
                       <Switch
                         config={{
                           name: 'pushNotifications',
                           label: 'Push Notifications - Receive push notifications in browser',
                           type: 'switch'
                         }}
                         value={localSettings?.notifications?.pushNotifications ?? true}
                         onChange={(checked: boolean) => setLocalSettings(prev => ({
                          ...prev,
                           notifications: { ...prev?.notifications || settings.notifications, pushNotifications: checked }
                        }))}
                      />
                    </div>
                      </div>

                                    {/* Business Updates */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Business Updates</Label>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200 mt-4">
                       <Switch
                         config={{
                           name: 'tenderUpdates',
                           label: 'Tender Updates - Get notified about tender changes',
                           type: 'switch'
                         }}
                         value={localSettings?.notifications?.tenderUpdates ?? true}
                         onChange={(checked: boolean) => setLocalSettings(prev => ({
                          ...prev,
                           notifications: { ...prev?.notifications || settings.notifications, tenderUpdates: checked }
                        }))}
                      />
                       <Switch
                         config={{
                           name: 'vendorUpdates',
                           label: 'Vendor Updates - Get notified about vendor changes',
                           type: 'switch'
                         }}
                         value={localSettings?.notifications?.vendorUpdates ?? true}
                         onChange={(checked: boolean) => setLocalSettings(prev => ({
                          ...prev,
                           notifications: { ...prev?.notifications || settings.notifications, vendorUpdates: checked }
                        }))}
                      />
                    </div>
                      </div>

                                    {/* System Notifications */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">System Notifications</Label>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200 mt-4">
                       <Switch
                         config={{
                           name: 'systemAlerts',
                           label: 'System Alerts - Get notified about system issues',
                           type: 'switch'
                         }}
                         value={localSettings?.notifications?.systemAlerts ?? true}
                         onChange={(checked: boolean) => setLocalSettings(prev => ({
                          ...prev,
                           notifications: { ...prev?.notifications || settings.notifications, systemAlerts: checked }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                                  <CardContent className="space-y-6">
                    {/* Two-Factor Authentication Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-semibold">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security to your account by requiring a verification code in addition to your password.
                          </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={(localSettings?.security?.twoFactorAuth ?? settings.security.twoFactorAuth) ? 'success' : 'secondary'}>
                          {(localSettings?.security?.twoFactorAuth ?? settings.security.twoFactorAuth) ? 'Enabled' : 'Disabled'}
                        </Badge>
                          {twoFactorSetup.step === 'idle' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleEnable2FA}
                            >
                          {(localSettings?.security?.twoFactorAuth ?? settings.security.twoFactorAuth) ? 'Disable' : 'Enable'}
                        </Button>
                          )}
                      </div>
                    </div>

                      {/* Setup Flow: QR Code Step */}
                      {twoFactorSetup.step === 'qr' && (
                        <div className="border rounded-lg p-6 bg-blue-50 border-blue-200 space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Step 1: Scan QR Code</h4>
                            <p className="text-sm text-gray-600">
                              Use an authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator) to scan this QR code.
                            </p>
                          </div>
                          <div className="flex items-start space-x-6">
                            <div className="border-2 border-white rounded-lg p-2 bg-white">
                              <img 
                                src={twoFactorSetup.qrCode} 
                                alt="QR Code for 2FA setup" 
                                className="w-48 h-48"
                      />
                    </div>
                              <div className="flex-1 space-y-4">
                                <TextInput
                                  config={{
                                    name: 'secretKey',
                                    label: 'Can\'t scan? Enter this code manually:',
                                    type: 'text',
                                    placeholder: 'Enter secret key'
                                  }}
                                  value={twoFactorSetup.secretKey}
                                  onChange={() => {}}
                                  disabled={true}
                                  canCopy={true}
                                />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => setTwoFactorSetup({ ...twoFactorSetup, step: 'verify' })}
                                  className="flex-1"
                                >
                                  I've scanned the code
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setTwoFactorSetup({ ...twoFactorSetup, step: 'idle' })}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Setup Flow: Verification Step */}
                      {twoFactorSetup.step === 'verify' && (
                        <div className="border rounded-lg p-6 bg-blue-50 border-blue-200 space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Step 2: Verify Setup</h4>
                            <p className="text-sm text-gray-600">
                              Enter the 6-digit code from your authenticator app to verify the setup.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="max-w-xs">
                              <TextInput
                                config={{
                                  name: 'verificationCode',
                                  label: 'Verification Code',
                                  type: 'text',
                                  placeholder: '000000'
                                }}
                                value={twoFactorSetup.verificationCode}
                                onChange={(value: string) => {
                                  // Only allow 6 digits
                                  const digits = value.replace(/\D/g, '').slice(0, 6);
                                  setTwoFactorSetup({ ...twoFactorSetup, verificationCode: digits });
                                }}
                                maxLength={6}
                      />
                    </div>
                      <div className="flex space-x-2">
                              <Button
                                onClick={handleVerify2FA}
                                disabled={twoFactorSetup.verificationCode.length !== 6}
                          className="flex-1"
                              >
                                Verify & Enable
                              </Button>
                        <Button
                          variant="outline"
                                onClick={() => setTwoFactorSetup({ ...twoFactorSetup, step: 'qr', verificationCode: '' })}
                        >
                                Back
                        </Button>
                      </div>
                    </div>
                        </div>
                      )}

                      {/* Setup Flow: Backup Codes Step */}
                      {twoFactorSetup.step === 'backup' && (
                        <div className="border rounded-lg p-6 bg-amber-50 border-amber-200 space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Step 3: Save Backup Codes</h4>
                            <p className="text-sm text-gray-600">
                              Save these backup codes in a safe place. You can use them to access your account if you lose access to your authenticator device.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 p-4 bg-white rounded border border-amber-300">
                            {twoFactorSetup.backupCodes.map((code, index) => (
                              <code key={index} className="text-sm font-mono py-1">
                                {code}
                              </code>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                const codesText = twoFactorSetup.backupCodes.join('\n');
                                navigator.clipboard.writeText(codesText);
                              }}
                            >
                              Copy All Codes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleRegenerateBackupCodes}
                            >
                              Regenerate Codes
                            </Button>
                            <Button
                              onClick={handleContinueFromBackup}
                              className="ml-auto"
                            >
                              I've saved my codes
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Enabled State: Show Backup Codes Option */}
                      {(localSettings?.security?.twoFactorAuth ?? settings.security.twoFactorAuth) && twoFactorSetup.step === 'idle' && (
                        <div className="border rounded-lg p-4 bg-gray-50 border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-medium">Backup Codes</Label>
                              <p className="text-sm text-gray-600 mt-1">
                                View or regenerate your backup codes for account recovery.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (twoFactorSetup.backupCodes.length === 0) {
                                  const codes = generateBackupCodes();
                                  setTwoFactorSetup({ ...twoFactorSetup, backupCodes: codes });
                                }
                                setTwoFactorSetup({ ...twoFactorSetup, step: 'backup' });
                              }}
                            >
                              {twoFactorSetup.backupCodes.length > 0 ? 'View Codes' : 'Generate Codes'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <Label className="text-base font-semibold mb-4 block">Change Password</Label>
                        <div className="space-y-4">
                    <PasswordInput
                      config={{
                        name: 'currentPassword',
                              label: 'Current Password',
                        type: 'password',
                              placeholder: 'Enter your current password'
                      }}
                            value={passwordChange.currentPassword}
                            onChange={(value: string) => {
                              setPasswordChange(prev => ({ ...prev, currentPassword: value }));
                              setPasswordError(null);
                            }}
                          />
                          <PasswordInput
                            config={{
                              name: 'newPassword',
                              label: 'New Password',
                              type: 'password',
                              placeholder: 'Enter your new password (min 8 characters)'
                            }}
                            value={passwordChange.newPassword}
                            onChange={(value: string) => {
                              setPasswordChange(prev => ({ ...prev, newPassword: value }));
                              setPasswordError(null);
                            }}
                          />
                          <PasswordInput
                            config={{
                              name: 'confirmPassword',
                              label: 'Confirm New Password',
                              type: 'password',
                              placeholder: 'Confirm your new password'
                            }}
                            value={passwordChange.confirmPassword}
                            onChange={(value: string) => {
                              setPasswordChange(prev => ({ ...prev, confirmPassword: value }));
                              setPasswordError(null);
                            }}
                          />
                          {passwordError && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {passwordError}
                            </div>
                          )}
                          <Button
                            onClick={handlePasswordChange}
                            disabled={passwordLoading || !passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword}
                            className="w-full sm:w-auto"
                          >
                            {passwordLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Changing Password...
                              </>
                            ) : (
                              'Change Password'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Select
                      config={{
                        name: 'theme',
                        label: 'Theme',
                        type: 'select',
                        placeholder: 'Select theme'
                      }}
                        value={localSettings?.appearance?.theme ?? settings.appearance.theme}
                      onValueChange={(value: string) => setLocalSettings(prev => ({
                          ...prev,
                        appearance: { ...prev?.appearance || settings.appearance, theme: value as 'light' | 'dark' | 'auto' }
                        }))}
                      options={[
                        { label: 'Light', value: 'light' },
                        { label: 'Dark', value: 'dark' },
                        { label: 'Auto', value: 'auto' }
                      ]}
                    />
                    <Select
                      config={{
                        name: 'language',
                        label: 'Language',
                        type: 'select',
                        placeholder: 'Select language'
                      }}
                        value={localSettings?.appearance?.language ?? settings.appearance.language}
                      onValueChange={(value: string) => setLocalSettings(prev => ({
                          ...prev,
                        appearance: { ...prev?.appearance || settings.appearance, language: value }
                        }))}
                      options={[
                        { label: 'English', value: 'en' },
                        { label: 'Spanish', value: 'es' },
                        { label: 'French', value: 'fr' },
                        { label: 'German', value: 'de' }
                      ]}
                    />
                    <Select
                      config={{
                        name: 'timezone',
                        label: 'Timezone',
                        type: 'select',
                        placeholder: 'Select timezone'
                      }}
                        value={localSettings?.appearance?.timezone ?? settings.appearance.timezone}
                      onValueChange={(value: string) => setLocalSettings(prev => ({
                          ...prev,
                        appearance: { ...prev?.appearance || settings.appearance, timezone: value }
                        }))}
                      options={[
                        { label: 'Eastern Time', value: 'America/New_York' },
                        { label: 'Central Time', value: 'America/Chicago' },
                        { label: 'Mountain Time', value: 'America/Denver' },
                        { label: 'Pacific Time', value: 'America/Los_Angeles' },
                        { label: 'UTC', value: 'UTC' }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
