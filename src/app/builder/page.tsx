'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Link2, 
  ArrowRight,
  Layers,
  Palette,
  Settings
} from 'lucide-react';

interface BuilderOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: number;
  }[];
  features: string[];
}

const builderOptions: BuilderOption[] = [
  {
    id: 'schemas',
    title: 'Schema Builder',
    description: 'Create and manage dynamic form schemas for entities like inquiries, vendors, and purchase orders',
    icon: FileText,
    href: '/builder/schemas',
    color: '#8B5CF6',
    features: [
      'Define fields and sections',
      'Configure validation rules',
      'Set up form layouts',
      'Manage metadata',
    ],
  },
  {
    id: 'relation-types',
    title: 'Relation Types',
    description: 'Define and manage relationships between entities in your supply chain',
    icon: Link2,
    href: '/builder/relation-types',
    color: '#4E79A7',
    features: [
      'Create entity relationships',
      'Set visual indicators',
      'Configure icons and colors',
      'Manage relation metadata',
    ],
  },
];

export default function BuilderPage() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <MainLayout
      title="Builder"
      subtitle="Configure and manage your application's data models and relationships"
      icon="Settings"
    >
      <div className="space-y-8">
        {/* Header Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <p className="text-gray-600 text-lg">
            Use the builders below to configure your supply chain management system.
            Define schemas for your entities and establish relationships between them.
          </p>
        </motion.div>

        {/* Builder Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {builderOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group h-full border-2 hover:border-violet-300 flex flex-col justify-between"
                  onClick={() => handleCardClick(option.href)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${option.color}15` }}
                      >
                        <Icon 
                          className="h-8 w-8" 
                          style={{ color: option.color }}
                        />
                      </div>
                      <ArrowRight 
                        className="h-5 w-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <CardTitle className="text-2xl mb-2">{option.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Features List */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Features
                        </h4>
                        <ul className="space-y-1.5">
                          {option.features.map((feature, idx) => (
                            <li 
                              key={idx}
                              className="text-sm text-gray-600 flex items-center gap-2"
                            >
                              <div 
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: option.color }}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Stats */}
                      {option.stats && option.stats.length > 0 && (
                        <div className="flex gap-4 pt-2 border-t border-gray-200">
                          {option.stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div 
                                className="p-1.5 rounded"
                                style={{ backgroundColor: `${option.color}15` }}
                              >
                                {stat.label === 'Sections' && <Layers className="h-4 w-4" style={{ color: option.color }} />}
                                {stat.label === 'Fields' && <FileText className="h-4 w-4" style={{ color: option.color }} />}
                              </div>
                              <div>
                                <p className="text-lg font-bold" style={{ color: option.color }}>
                                  {stat.value}
                                </p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{
                          backgroundColor: `${option.color}10`,
                          color: option.color,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = option.color;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${option.color}10`;
                          e.currentTarget.style.color = option.color;
                        }}
                      >
                        <span>Open {option.title}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Getting Started
          </h3>
          <p className="text-blue-800 mb-4">
            Start by creating a schema for your entities, then define relationships between them. 
            Each builder provides a visual interface to configure your data models.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-blue-700">
            <span className="font-semibold">Tip:</span>
            <span>Schemas define the structure of your data, while relation types connect different entities together.</span>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

