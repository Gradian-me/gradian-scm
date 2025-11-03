'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  FileText,
  Link2,
  Building2,
  ArrowRight,
  Layers,
  Palette,
  Settings,
  RefreshCw
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  FileText,
  Link2,
  Building2,
  Settings,
};

interface BuilderOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: number;
  }[];
  features: string[];
}

export default function BuilderPage() {
  const router = useRouter();
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [builderOptions, setBuilderOptions] = useState<BuilderOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuilders = async () => {
      try {
        const response = await fetch('/api/builders');
        const data = await response.json();
        
        if (data.success) {
          setBuilderOptions(data.data);
        } else {
          toast.error('Failed to load builders');
        }
      } catch (error) {
        toast.error('Failed to load builders');
        console.error('Error fetching builders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilders();
  }, []);

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);

    const toastId = toast.loading('Clearing schema cache...');

    try {
      const response = await fetch('/api/schemas/clear-cache', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Schema cache cleared successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to clear cache', { id: toastId });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to clear cache',
        { id: toastId }
      );
    } finally {
      setIsClearingCache(false);
    }
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
        >
          <div className="flex items-start justify-between gap-4 mb-4 w-full flex-wrap">
            <p className="text-gray-600 text-lg max-w-4xl">
              Use the builders below to configure your supply chain management system.
              Define schemas for your entities and establish relationships between them.
            </p>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="whitespace-nowrap"
              >
                {isClearingCache ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Builder Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {builderOptions.map((option, index) => {
              const Icon = iconMap[option.icon] || Settings;
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
        )}

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

