'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CHART_COLOR_PALETTE, CHART_ANIMATION_CONFIG, CHART_THEME } from '@/gradian-ui/shared/constants/chart-theme';

interface VendorPerformanceData {
  vendor: string;
  rating: number;
  onTimeDelivery: number;
  qualityScore: number;
  totalOrders: number;
}

interface VendorPerformanceChartProps {
  data: VendorPerformanceData[];
}

export function VendorPerformanceChart({ data }: VendorPerformanceChartProps) {
  const chartOption = useMemo(() => {
    const vendors = data.map(item => item.vendor);
    const ratings = data.map(item => item.rating);
    const onTimeDelivery = data.map(item => item.onTimeDelivery);
    const qualityScores = data.map(item => item.qualityScore);

    return {
      ...CHART_THEME,
      animation: true,
      animationDuration: CHART_ANIMATION_CONFIG.duration,
      animationEasing: CHART_ANIMATION_CONFIG.easing,
      grid: {
        ...CHART_THEME.grid,
        top: '15%',
        bottom: '15%',
      },
      xAxis: {
        ...CHART_THEME.xAxis,
        type: 'category',
        data: vendors,
        axisLabel: {
          ...CHART_THEME.xAxis.axisLabel,
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: [
        {
          ...CHART_THEME.yAxis,
          type: 'value',
          name: 'Rating & Scores',
          nameLocation: 'middle',
          nameGap: 50,
          min: 0,
          max: 5,
          axisLabel: {
            ...CHART_THEME.yAxis.axisLabel,
            formatter: (value: number) => value.toFixed(1),
          },
        },
        {
          ...CHART_THEME.yAxis,
          type: 'value',
          name: 'On-Time Delivery (%)',
          nameLocation: 'middle',
          nameGap: 50,
          min: 0,
          max: 100,
          axisLabel: {
            ...CHART_THEME.yAxis.axisLabel,
            formatter: (value: number) => `${value}%`,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Rating',
          type: 'bar',
          yAxisIndex: 0,
          data: ratings,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLOR_PALETTE[0] },
                { offset: 1, color: CHART_COLOR_PALETTE[0] + '80' }
              ]
            },
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(59, 130, 246, 0.5)',
            },
          },
          animationDelay: (idx: number) => idx * 100,
        },
        {
          name: 'Quality Score',
          type: 'line',
          yAxisIndex: 0,
          data: qualityScores,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: CHART_COLOR_PALETTE[2],
            width: 3,
            type: 'solid',
          },
          itemStyle: {
            color: CHART_COLOR_PALETTE[2],
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(6, 182, 212, 0.5)',
              scale: 1.3,
            },
          },
          animationDelay: (idx: number) => idx * 100 + 200,
        },
        {
          name: 'On-Time Delivery',
          type: 'line',
          yAxisIndex: 1,
          data: onTimeDelivery,
          smooth: true,
          symbol: 'diamond',
          symbolSize: 8,
          lineStyle: {
            color: CHART_COLOR_PALETTE[4],
            width: 3,
            type: 'dashed',
          },
          itemStyle: {
            color: CHART_COLOR_PALETTE[4],
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(16, 185, 129, 0.5)',
              scale: 1.3,
            },
          },
          animationDelay: (idx: number) => idx * 100 + 400,
        },
      ],
      tooltip: {
        ...CHART_THEME.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        formatter: (params: any[]) => {
          const ratingParam = params.find(p => p.seriesName === 'Rating');
          const qualityParam = params.find(p => p.seriesName === 'Quality Score');
          const deliveryParam = params.find(p => p.seriesName === 'On-Time Delivery');
          
          return `
            <div style="padding: 12px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #111827;">${params[0].axisValue}</div>
              ${ratingParam ? `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${ratingParam.color}; border-radius: 2px; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">Rating:</span>
                  <span style="font-weight: 600; color: #111827;">${ratingParam.value}/5.0</span>
                </div>
              ` : ''}
              ${qualityParam ? `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${qualityParam.color}; border-radius: 50%; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">Quality Score:</span>
                  <span style="font-weight: 600; color: #111827;">${qualityParam.value}/5.0</span>
                </div>
              ` : ''}
              ${deliveryParam ? `
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${deliveryParam.color}; border-radius: 0; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">On-Time Delivery:</span>
                  <span style="font-weight: 600; color: #111827;">${deliveryParam.value}%</span>
                </div>
              ` : ''}
            </div>
          `;
        },
      },
      legend: {
        ...CHART_THEME.legend,
        top: '5%',
        right: '5%',
        orient: 'vertical',
        itemGap: 15,
        itemWidth: 14,
        itemHeight: 14,
      },
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Vendor Performance</span>
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
