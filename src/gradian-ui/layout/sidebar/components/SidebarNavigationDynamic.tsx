'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { cn } from '../../../shared/utils';
import { FormSchema } from '@/shared/types/form-schema';
import { Brain } from 'lucide-react';

interface SidebarNavigationDynamicProps {
  isCollapsed: boolean;
  isMobile: boolean;
  className?: string;
}

export const SidebarNavigationDynamic: React.FC<SidebarNavigationDynamicProps> = ({
  isCollapsed,
  isMobile,
  className
}) => {
  const pathname = usePathname();
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      const response = await fetch('/api/schemas');
      const result = await response.json();
      
      if (result.success) {
        // Filter schemas that have showInNavigation enabled
        const navigationSchemas = result.data.filter((schema: FormSchema) => 
          schema.showInNavigation === true
        );
        setSchemas(navigationSchemas);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || schemas.length === 0) {
    return null;
  }

  const isActive = (schemaId: string) => {
    return pathname.includes(`/page/${schemaId}`);
  };

  return (
    <div className={cn("w-full px-0 mt-3", className)}>
      <Separator className="my-4 bg-gray-700" />
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="intelligent-systems" className="border-none">
          <AccordionTrigger className={cn(
            "px-3 py-2 text-gray-300 hover:text-white",
            "hover:bg-gray-800 rounded-lg transition-colors",
            "data-[state=open]:text-white"
          )}>
            <div className="flex items-center space-x-3 flex-1">
              <Brain className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-medium"
                  >
                    Intelligent Systems
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-3 pr-0 pb-0">
            <nav className="space-y-1 mt-1">
              {schemas.map((schema) => {
                const active = isActive(schema.id);
                return (
                  <Link key={schema.id} href={`/page/${schema.id}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                        active
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      {schema.icon ? (
                        <IconRenderer 
                          iconName={schema.icon} 
                          className="h-5 w-5 shrink-0" 
                        />
                      ) : (
                        <div className="h-5 w-5 shrink-0 rounded bg-gray-700" />
                      )}
                      <AnimatePresence>
                        {(!isCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-xs font-medium"
                          >
                            {schema.plural_name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

SidebarNavigationDynamic.displayName = 'SidebarNavigationDynamic';

