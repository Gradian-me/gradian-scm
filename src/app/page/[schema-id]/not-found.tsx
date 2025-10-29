'use client';

import { motion } from 'framer-motion';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '../../../components/layout/main-layout';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

export default function NotFoundPage() {
  return (
    <MainLayout title="Page Not Found">
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-violet-100 rounded-full blur-2xl opacity-50" />
                <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-full w-32 h-32 flex items-center justify-center">
                  <FileQuestion className="h-16 w-16 text-violet-600" strokeWidth={1.5} />
                </div>
              </motion.div>

              {/* Text Content */}
              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900"
                >
                  Schema Not Found
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-600 max-w-md"
                >
                  The schema you're looking for doesn't exist or hasn't been configured yet.
                </motion.p>
              </div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md"
              >
                <p className="text-sm text-blue-800">
                  <strong>Need this page?</strong> Contact your system administrator to configure the schema for this entity.
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Go Back</span>
                </Button>
                <Link href="/">
                  <Button className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700">
                    <Home className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Button>
                </Link>
              </motion.div>

              {/* Debug Info (optional - can be removed in production) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-8 border-t border-gray-200 w-full"
              >
                <p className="text-xs text-gray-500">
                  Error Code: 404 | Schema Not Found
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}

