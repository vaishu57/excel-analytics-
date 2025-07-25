"use client";

import * as React from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
  RadarChart,
  FunnelChart,
  Bar,
  Line,
  Pie,
  Scatter,
  Area,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type DataRow = Record<string, string | number>;

interface ChartDisplayProps {
  data: DataRow[];
  chartType: string;
  chartDimension: '2d' | '3d';
  xAxis: string;
  yAxis: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// A custom shape for the bar chart to give it a 3D effect
const getPath = (x: number, y: number, width: number, height: number) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${x + width / 2},${y}C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width},${y + height}Z`;
};

const TriangleBar: React.FC<any> = (props) => {
  const { fill, x, y, width, height } = props;
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};


const ChartDisplay = React.forwardRef<HTMLDivElement, ChartDisplayProps>(({ data, chartType, chartDimension, xAxis, yAxis }, ref) => {
  if (!xAxis || !yAxis || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select X and Y axes to display the chart.</p>
      </div>
    );
  }

  const chartConfig = {
    [yAxis]: {
      label: yAxis,
      color: "hsl(var(--primary))",
    },
    [xAxis]: {
      label: xAxis,
      color: "hsl(var(--accent))",
    }
  };
  
  const pieData = data.map(item => ({ name: String(item[xAxis]), value: Number(item[yAxis]) || 0 })).filter(d => d.value > 0);
  const funnelData = data.map((item, index) => ({ name: String(item[xAxis]), value: Number(item[yAxis]) || 0, fill: COLORS[index % COLORS.length] })).filter(d => d.value > 0);

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        const is3D = chartDimension === '3d';
        return (
          <BarChart data={data}>
             <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`grad-${index}`} id={`color3d${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={is3D ? 0.2 : 0.8}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xAxis} tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
            <Bar dataKey={yAxis} shape={is3D ? <TriangleBar /> : undefined} label={!is3D ? { position: 'top' } : undefined}>
              {data.map((_entry, index) => (
                 <Cell key={`cell-${index}`} fill={`url(#color3d${index % COLORS.length})`} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xAxis} tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey={yAxis} stroke={COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        );
       case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xAxis} tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey={yAxis} stroke={COLORS[2]} fillOpacity={1} fill="url(#colorArea)" />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend content={<ChartLegendContent />} />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="category" dataKey={xAxis} name={xAxis} stroke="hsl(var(--muted-foreground))" />
            <YAxis type="number" dataKey={yAxis} name={yAxis} stroke="hsl(var(--muted-foreground))" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
            <Scatter name="Data points" data={data} dataKey={yAxis}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Scatter>
          </ScatterChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
            <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<ChartTooltipContent />} />
            <Radar name={yAxis} dataKey={yAxis} stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.6} />
            <Legend content={<ChartLegendContent />} />
          </RadarChart>
        );
      case 'funnel':
        return (
            <FunnelChart>
                <Tooltip />
                <Funnel
                    data={funnelData}
                    dataKey="value"
                    nameKey="name"
                >
                  <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                </Funnel>
            </FunnelChart>
        );
      default:
        return null;
    }
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-full bg-card p-4" ref={ref}>
      {renderChart()}
    </ChartContainer>
  );
});
ChartDisplay.displayName = "ChartDisplay";

export default ChartDisplay;
