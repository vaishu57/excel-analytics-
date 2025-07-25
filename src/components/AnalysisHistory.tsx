import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Upload, Trash2, BarChart2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type HistoryEntry = {
  id: string;
  timestamp: number;
  fileName: string;
  chartType: string;
  chartDimension: '2d' | '3d';
  xAxis: string;
  yAxis: string;
};

interface AnalysisHistoryProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export default function AnalysisHistory({ history, onLoad, onDelete }: AnalysisHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5 text-primary" />
          Analysis History
        </CardTitle>
        <CardDescription>Review and reload your past analyses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="p-3 border rounded-lg bg-muted/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    {entry.chartType === 'bar' && entry.chartDimension === '3d' ? '3D ' : ''}
                    {entry.chartType.charAt(0).toUpperCase() + entry.chartType.slice(1)} Chart
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    File: <span className="font-medium text-foreground">{entry.fileName}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Axes: <span className="font-medium text-foreground">{entry.xAxis}</span> vs <span className="font-medium text-foreground">{entry.yAxis}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                   <Button variant="outline" size="sm" onClick={() => onLoad(entry)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Load
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(entry.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    