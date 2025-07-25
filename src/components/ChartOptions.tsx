import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ChartOptionsProps {
  columns: string[];
  chartType: string;
  onChartTypeChange: (type: string) => void;
  chartDimension: '2d' | '3d';
  onChartDimensionChange: (dimension: '2d' | '3d') => void;
  xAxis: string;
  onXAxisChange: (axis: string) => void;
  yAxis: string;
  onYAxisChange: (axis: string) => void;
}

export default function ChartOptions({
  columns,
  chartType,
  onChartTypeChange,
  chartDimension,
  onChartDimensionChange,
  xAxis,
  onXAxisChange,
  yAxis,
  onYAxisChange,
}: ChartOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="chart-type" className="mb-2 block">Chart Type</Label>
        <Select value={chartType} onValueChange={onChartTypeChange}>
          <SelectTrigger id="chart-type">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="scatter">Scatter Chart</SelectItem>
            <SelectItem value="radar">Radar Chart</SelectItem>
            <SelectItem value="funnel">Funnel Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <div>
        <Label htmlFor="chart-dimension" className="mb-2 block">Dimension</Label>
        <Select 
          value={chartDimension} 
          onValueChange={(val) => onChartDimensionChange(val as '2d' | '3d')}
          disabled={chartType !== 'bar'}
        >
          <SelectTrigger id="chart-dimension">
            <SelectValue placeholder="Select dimension" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2d">2D</SelectItem>
            <SelectItem value="3d">3D</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="x-axis" className="mb-2 block">X-Axis</Label>
        <Select value={xAxis} onValueChange={onXAxisChange} disabled={columns.length === 0}>
          <SelectTrigger id="x-axis">
            <SelectValue placeholder="Select X-axis" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="y-axis" className="mb-2 block">Y-Axis</Label>
        <Select value={yAxis} onValueChange={onYAxisChange} disabled={columns.length === 0}>
          <SelectTrigger id="y-axis">
            <SelectValue placeholder="Select Y-axis" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
