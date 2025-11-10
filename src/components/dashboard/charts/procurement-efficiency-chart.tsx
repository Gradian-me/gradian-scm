'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CHART_COLOR_PALETTE, CHART_ANIMATION_CONFIG, CHART_THEME } from '@/gradian-ui/shared/constants/chart-theme';

interface ProcurementEfficiencyData {
  month: string;
  processingTime: number;
  costSavings: number;
  cycleTime: number;
  automationRate: number;
}

interface ProcurementEfficiencyChartProps {
  data: ProcurementEfficiencyData[];
}

export function ProcurementEfficiencyChart({ data }: ProcurementEfficiencyChartProps) {
  const chartOption = useMemo(() => {
    const months = data.map(item => item.month);
    const processingTime = data.map(item => item.processingTime);
    const costSavings = data.map(item => item.costSavings);
    const cycleTime = data.map(item => item.cycleTime);
    const automationRate = data.map(item => item.automationRate);

    return {
      ...CHART_THEME,
      animation: true,
      animationDuration: CHART_ANIMATION_CONFIG.duration,
      animationEasing: CHART_ANIMATION_CONFIG.easing,
      grid: {
        ...CHART_THEME.grid,
        top: '26%',
        bottom: '15%',
      },
      xAxis: {
        ...CHART_THEME.xAxis,
        type: 'category',
        data: months,
        axisLabel: {
          ...CHART_THEME.xAxis.axisLabel,
          interval: 0,
          rotate: 0,
        },
      },
      yAxis: [
        {
          ...CHART_THEME.yAxis,
          type: 'value',
          name: 'Days',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            color: CHART_COLOR_PALETTE[0],
            fontWeight: '600',
          },
          axisLabel: {
            ...CHART_THEME.yAxis.axisLabel,
            formatter: (value: number) => `${value}d`,
          },
        },
        {
          ...CHART_THEME.yAxis,
          type: 'value',
          name: 'Cost Savings ($)',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            color: CHART_COLOR_PALETTE[4],
            fontWeight: '600',
          },
          axisLabel: {
            ...CHART_THEME.yAxis.axisLabel,
            formatter: (value: number) => `$${(value / 1000).toFixed(0)}k`,
          },
          splitLine: {
            show: false,
          },
        },
        {
          ...CHART_THEME.yAxis,
          type: 'value',
          name: 'Automation Rate (%)',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            color: CHART_COLOR_PALETTE[2],
            fontWeight: '600',
          },
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
          name: 'Processing Time',
          type: 'bar',
          yAxisIndex: 0,
          data: processingTime,
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
          name: 'Cost Savings',
          type: 'line',
          yAxisIndex: 1,
          data: costSavings,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: CHART_COLOR_PALETTE[4],
            width: 3,
            type: 'solid',
          },
          itemStyle: {
            color: CHART_COLOR_PALETTE[4],
            borderColor: '#fff',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLOR_PALETTE[4] + '20' },
                { offset: 1, color: CHART_COLOR_PALETTE[4] + '05' }
              ]
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(16, 185, 129, 0.5)',
              scale: 1.3,
            },
          },
          animationDelay: (idx: number) => idx * 100 + 200,
        },
        {
          name: 'Cycle Time',
          type: 'line',
          yAxisIndex: 0,
          data: cycleTime,
          smooth: true,
          symbol: 'diamond',
          symbolSize: 8,
          lineStyle: {
            color: CHART_COLOR_PALETTE[1],
            width: 3,
            type: 'dashed',
          },
          itemStyle: {
            color: CHART_COLOR_PALETTE[1],
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(139, 92, 246, 0.5)',
              scale: 1.3,
            },
          },
          animationDelay: (idx: number) => idx * 100 + 400,
        },
        {
          name: 'Automation Rate',
          type: 'line',
          yAxisIndex: 2,
          data: automationRate,
          smooth: true,
          symbol: 'triangle',
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
          animationDelay: (idx: number) => idx * 100 + 600,
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
          const processingParam = params.find(p => p.seriesName === 'Processing Time');
          const savingsParam = params.find(p => p.seriesName === 'Cost Savings');
          const cycleParam = params.find(p => p.seriesName === 'Cycle Time');
          const automationParam = params.find(p => p.seriesName === 'Automation Rate');
          
          return `
            <div style="padding: 12px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #111827;">${params[0].axisValue}</div>
              ${processingParam ? `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${processingParam.color}; border-radius: 2px; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">Processing Time:</span>
                  <span style="font-weight: 600; color: #111827;">${processingParam.value} days</span>
                </div>
              ` : ''}
              ${savingsParam ? `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${savingsParam.color}; border-radius: 50%; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">Cost Savings:</span>
                  <span style="font-weight: 600; color: #111827;">$${savingsParam.value.toLocaleString()}</span>
                </div>
              ` : ''}
              ${cycleParam ? `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${cycleParam.color}; border-radius: 0; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">Cycle Time:</span>
                  <span style="font-weight: 600; color: #111827;">${cycleParam.value} days</span>
                </div>
              ` : ''}
              ${automationParam ? `
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${automationParam.color}; border-radius: 0; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">Automation Rate:</span>
                  <span style="font-weight: 600; color: #111827;">${automationParam.value}%</span>
                </div>
              ` : ''}
            </div>
          `;
        },
      },
      legend: {
        ...CHART_THEME.legend,
        top: '6%',
        left: '2%',
        orient: 'horizontal',
        align: 'left',
        itemGap: 18,
        itemWidth: 14,
        itemHeight: 14,
      },
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Procurement Efficiency</span>
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
