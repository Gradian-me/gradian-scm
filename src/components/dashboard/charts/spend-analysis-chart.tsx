'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CHART_COLOR_PALETTE, CHART_ANIMATION_CONFIG, CHART_THEME } from '@/gradian-ui/shared/constants/chart-theme';

interface SpendAnalysisData {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface SpendAnalysisChartProps {
  data: SpendAnalysisData[];
}

export function SpendAnalysisChart({ data }: SpendAnalysisChartProps) {
  const chartOption = useMemo(() => {
    const chartData = data.map((item, index) => ({
      name: item.category,
      value: item.amount,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 1,
          colorStops: [
            { offset: 0, color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] },
            { offset: 1, color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] + '80' }
          ]
        },
        borderRadius: 8,
        borderWidth: 0,
      },
    }));

    return {
      ...CHART_THEME,
      animation: true,
      animationDuration: CHART_ANIMATION_CONFIG.duration,
      animationEasing: CHART_ANIMATION_CONFIG.easing,
      series: [
        {
          name: 'Spend by Category',
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['60%', '48%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{d}%',
            fontSize: 11,
            fontWeight: '500',
            color: '#374151',
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            smooth: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              scale: 1.05,
            },
            label: {
              show: true,
              fontSize: 12,
              fontWeight: '600',
            },
          },
          data: chartData,
        },
      ],
      tooltip: {
        ...CHART_THEME.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; border-radius: 50%; margin-right: 8px;"></span>
                <span>Amount: $${params.value.toLocaleString()}</span>
              </div>
              <div style="color: #6B7280; font-size: 11px;">${params.percent}% of total spend</div>
            </div>
          `;
        },
      },
      legend: {
        ...CHART_THEME.legend,
        top: '4%',
        left: '2%',
        orient: 'vertical',
        align: 'left',
        itemGap: 12,
        icon: 'circle',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          ...CHART_THEME.legend.textStyle,
          fontSize: 11,
        },
      },
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Spend by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ReactECharts
              option={chartOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
