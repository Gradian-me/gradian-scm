'use client';

import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Avatar } from '@/gradian-ui/form-builder/form-elements';
import { useUserProfile, userProfileToSections, getUserInitials, ProfileCard } from '@/gradian-ui/profile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const params = useParams();
  const userId = params['user-id'] as string;
  
  const { profile, loading, error } = useUserProfile(userId);
  
  if (loading) {
    return (
      <MainLayout title="User Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }
  
  if (error || !profile) {
    return (
      <MainLayout title="User Profile">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">{error || 'Unable to load user profile'}</p>
        </div>
      </MainLayout>
    );
  }
  
  const sections = userProfileToSections(profile);
  
  return (
    <MainLayout title={profile.fullName}>
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <Avatar
                src={profile.avatar}
                alt={profile.fullName}
                fallback={getUserInitials(profile)}
                size="xl"
                variant="primary"
                className="border-4 border-white shadow-lg"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                {profile.jobTitle && (
                  <p className="text-lg text-gray-600 mt-1">{profile.jobTitle}</p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default" className="text-sm">
                  {profile.role}
                </Badge>
                {profile.department && (
                  <Badge variant="outline" className="text-sm">
                    {profile.department}
                  </Badge>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={section.colSpan === 2 ? "lg:col-span-2" : ""}
            >
              <ProfileCard section={section} />
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

