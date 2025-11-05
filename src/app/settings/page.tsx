'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Database, 
  Palette,
  Save,
  Shield,
  User
} from 'lucide-react';
import { useState } from 'react';
// Import Gradian UI form components
import { Switch } from '@/gradian-ui/form-builder/form-elements/components/Switch';
import { Label } from '@/gradian-ui/form-builder/form-elements/components/Label';
import { EmailInput } from '@/gradian-ui/form-builder/form-elements/components/EmailInput';
import { NumberInput } from '@/gradian-ui/form-builder/form-elements/components/NumberInput';
import { PasswordInput } from '@/gradian-ui/form-builder/form-elements/components/PasswordInput';
import { PhoneInput } from '@/gradian-ui/form-builder/form-elements/components/PhoneInput';
import { Select } from '@/gradian-ui/form-builder/form-elements/components/Select';
import { TextInput } from '@/gradian-ui/form-builder/form-elements/components/TextInput';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    step: 'idle' as 'idle' | 'qr' | 'verify' | 'backup',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Gradian%20SCM:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Gradian%20SCM',
    secretKey: 'JBSWY3DPEHPK3PXP',
    backupCodes: [] as string[],
    verificationCode: '',
  });
  const [settings, setSettings] = useState({
    profile: {
      name: 'Mahyar Abidi',
      email: 'mahyar.abidi@gradian.com',
      role: 'Supply Chain Manager',
      department: 'Supply Chain',
      phone: '+1-555-0123',
      isAdmin: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      tenderUpdates: true,
      vendorUpdates: true,
      systemAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      currentPassword: '',
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Settings saved:', settings);
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });
    return codes;
  };

  const handleEnable2FA = () => {
    if (!settings.security.twoFactorAuth) {
      // Generate backup codes
      const codes = generateBackupCodes();
      setTwoFactorSetup({
        ...twoFactorSetup,
        step: 'qr',
        backupCodes: codes,
      });
    } else {
      // Disable 2FA
      setSettings(prev => ({
        ...prev,
        security: { ...prev.security, twoFactorAuth: false }
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
    // In a real app, this would verify the code with the backend
    if (twoFactorSetup.verificationCode.length === 6) {
      setSettings(prev => ({
        ...prev,
        security: { ...prev.security, twoFactorAuth: true }
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
                          activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
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
                        label: 'Full Name',
                        type: 'text',
                        placeholder: 'Enter your full name'
                      }}
                        value={settings.profile.name}
                      onChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        profile: { ...prev.profile, name: value }
                        }))}
                      />
                    <EmailInput
                      config={{
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        placeholder: 'Enter your email'
                      }}
                        value={settings.profile.email}
                      onChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        profile: { ...prev.profile, email: value }
                        }))}
                      />
                    <TextInput
                      config={{
                        name: 'role',
                        label: 'Role',
                        type: 'text',
                        placeholder: 'Enter your role'
                      }}
                        value={settings.profile.role}
                      onChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        profile: { ...prev.profile, role: value }
                        }))}
                      />
                    <TextInput
                      config={{
                        name: 'department',
                        label: 'Department',
                        type: 'text',
                        placeholder: 'Enter your department'
                      }}
                        value={settings.profile.department}
                      onChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        profile: { ...prev.profile, department: value }
                        }))}
                      />
                    <PhoneInput
                      config={{
                        name: 'phone',
                        label: 'Phone',
                        type: 'tel',
                        placeholder: 'Enter your phone number'
                      }}
                        value={settings.profile.phone}
                      onChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        profile: { ...prev.profile, phone: value }
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
                         value={settings.notifications.emailNotifications}
                         onChange={(checked: boolean) => setSettings(prev => ({
                           ...prev,
                           notifications: { ...prev.notifications, emailNotifications: checked }
                         }))}
                       />
                       <Switch
                         config={{
                           name: 'pushNotifications',
                           label: 'Push Notifications - Receive push notifications in browser',
                           type: 'switch'
                         }}
                         value={settings.notifications.pushNotifications}
                         onChange={(checked: boolean) => setSettings(prev => ({
                           ...prev,
                           notifications: { ...prev.notifications, pushNotifications: checked }
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
                         value={settings.notifications.tenderUpdates}
                         onChange={(checked: boolean) => setSettings(prev => ({
                           ...prev,
                           notifications: { ...prev.notifications, tenderUpdates: checked }
                         }))}
                       />
                       <Switch
                         config={{
                           name: 'vendorUpdates',
                           label: 'Vendor Updates - Get notified about vendor changes',
                           type: 'switch'
                         }}
                         value={settings.notifications.vendorUpdates}
                         onChange={(checked: boolean) => setSettings(prev => ({
                           ...prev,
                           notifications: { ...prev.notifications, vendorUpdates: checked }
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
                         value={settings.notifications.systemAlerts}
                         onChange={(checked: boolean) => setSettings(prev => ({
                           ...prev,
                           notifications: { ...prev.notifications, systemAlerts: checked }
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
                          <Badge variant={settings.security.twoFactorAuth ? 'success' : 'secondary'}>
                            {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {twoFactorSetup.step === 'idle' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleEnable2FA}
                            >
                              {settings.security.twoFactorAuth ? 'Disable' : 'Enable'}
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
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Can't scan? Enter this code manually:</Label>
                                <div className="flex items-center space-x-2">
                                  <code className="px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm">
                                    {twoFactorSetup.secretKey}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(twoFactorSetup.secretKey)}
                                  >
                                    Copy
                                  </Button>
                                </div>
                              </div>
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
                      {settings.security.twoFactorAuth && twoFactorSetup.step === 'idle' && (
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
                    
                    <div className="space-y-4">
                    <NumberInput
                      config={{
                        name: 'sessionTimeout',
                        label: 'Session Timeout (minutes)',
                        type: 'number',
                        placeholder: 'Enter timeout in minutes'
                      }}
                        value={settings.security.sessionTimeout}
                      onChange={(value: number | string) => setSettings(prev => ({
                          ...prev,
                        security: { ...prev.security, sessionTimeout: typeof value === 'number' ? value : parseInt(String(value)) || 30 }
                        }))}
                      />
                    <NumberInput
                      config={{
                        name: 'passwordExpiry',
                        label: 'Password Expiry (days)',
                        type: 'number',
                        placeholder: 'Enter expiry in days'
                      }}
                        value={settings.security.passwordExpiry}
                      onChange={(value: number | string) => setSettings(prev => ({
                          ...prev,
                        security: { ...prev.security, passwordExpiry: typeof value === 'number' ? value : parseInt(String(value)) || 90 }
                        }))}
                      />
                    <PasswordInput
                      config={{
                        name: 'currentPassword',
                        label: 'Change Password',
                        type: 'password',
                        placeholder: 'Current password'
                      }}
                      value={settings.security.currentPassword}
                      onChange={(value: string) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, currentPassword: value }
                      }))}
                    />
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
                        value={settings.appearance.theme}
                      onValueChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        appearance: { ...prev.appearance, theme: value }
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
                        value={settings.appearance.language}
                      onValueChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        appearance: { ...prev.appearance, language: value }
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
                        value={settings.appearance.timezone}
                      onValueChange={(value: string) => setSettings(prev => ({
                          ...prev,
                        appearance: { ...prev.appearance, timezone: value }
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

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Management</h3>
                    <p className="text-gray-600 mb-4">
                      Configure and manage your ERP integrations and API connections.
                    </p>
                    <Button>
                      <Database className="h-4 w-4 mr-2" />
                      Manage Integrations
                    </Button>
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
