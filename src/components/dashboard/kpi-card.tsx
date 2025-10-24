'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  delay = 0 
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 bg-white hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-violet-50 rounded-full -translate-y-10 translate-x-10"></div>
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-semibold text-gray-600 group-hover:text-violet-700 transition-colors">
            {title}
          </CardTitle>
          <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm group-hover:bg-violet-700 transition-all duration-300">
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-baseline space-x-3">
            <div className="text-3xl font-bold text-gray-900 group-hover:text-violet-900 transition-colors">
              {value}
            </div>
            {trend && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                trend.isPositive 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 group-hover:text-violet-600 transition-colors">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
