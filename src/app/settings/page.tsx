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
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        config={{
                          name: 'emailNotifications',
                          label: '',
                          type: 'switch'
                        }}
                        value={settings.notifications.emailNotifications}
                        onChange={(checked: boolean) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, emailNotifications: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        config={{
                          name: 'pushNotifications',
                          label: '',
                          type: 'switch'
                        }}
                        value={settings.notifications.pushNotifications}
                        onChange={(checked: boolean) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, pushNotifications: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Tender Updates</Label>
                        <p className="text-sm text-gray-600">Get notified about tender changes</p>
                      </div>
                      <Switch
                        config={{
                          name: 'tenderUpdates',
                          label: '',
                          type: 'switch'
                        }}
                        value={settings.notifications.tenderUpdates}
                        onChange={(checked: boolean) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, tenderUpdates: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Vendor Updates</Label>
                        <p className="text-sm text-gray-600">Get notified about vendor changes</p>
                      </div>
                      <Switch
                        config={{
                          name: 'vendorUpdates',
                          label: '',
                          type: 'switch'
                        }}
                        value={settings.notifications.vendorUpdates}
                        onChange={(checked: boolean) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, vendorUpdates: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Alerts</Label>
                        <p className="text-sm text-gray-600">Get notified about system issues</p>
                      </div>
                      <Switch
                        config={{
                          name: 'systemAlerts',
                          label: '',
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
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={settings.security.twoFactorAuth ? 'success' : 'secondary'}>
                          {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {settings.security.twoFactorAuth ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
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
                    <div>
                      <Label>Change Password</Label>
                      <div className="flex space-x-2 mt-1">
                        <PasswordInput
                          config={{
                            name: 'currentPassword',
                            label: '',
                            type: 'password',
                            placeholder: 'Current password'
                          }}
                          value=""
                          onChange={() => {}}
                        />
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
