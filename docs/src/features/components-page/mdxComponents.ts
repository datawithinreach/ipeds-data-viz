import { BarChart } from '@/components/visualizations/BarChart/BarChart';
import { LineChart } from '@/components/visualizations/LineChart/LineChart';
import { Histogram } from '@/components/visualizations/Histogram/Histogram';
import { PieChart } from '@/components/visualizations/PieChart/PieChart';
import { ScatterPlot } from '@/components/visualizations/ScatterPlot/ScatterPlot';
import { Banner } from '@/components/visualizations/Banner/Banner';
import type { ComponentMap } from './types';

export const mdxComponents: ComponentMap = {
  BarChart,
  LineChart,
  Histogram,
  PieChart,
  ScatterPlot,
  Banner,
};
