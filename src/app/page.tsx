"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { WorkBook } from 'xlsx';
import * as XLSX from 'xlsx';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Save } from 'lucide-react';

import { suggestChartTypes } from '@/ai/flows/suggest-chart-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

import DataUploader from '@/components/DataUploader';
import DataTable from '@/components/DataTable';
import ChartOptions from '@/components/ChartOptions';
import ChartDisplay from '@/components/ChartDisplay';
import AISuggestions from '@/components/AISuggestions';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

type DataRow = Record<string, string | number>;
type HistoryEntry = {
  id: string;
  timestamp: number;
  fileName:string;
  chartType: string;
  chartDimension: '2d' | '3d';
  xAxis: string;
  yAxis: string;
};

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  
  const [chartType, setChartType] = useState('bar');
  const [chartDimension, setChartDimension] = useState<'2d' | '3d'>('2d');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const [isAISuggestionsLoading, setIsAISuggestionsLoading] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const datasetsKey = `datavis-canvas-datasets-${user.email}`;
      const activeFileNameKey = `datavis-canvas-active-filename-${user.email}`;
      const historyKey = `datavis-canvas-history-${user.email}`;
      
      try {
        const activeFileName = localStorage.getItem(activeFileNameKey);
        const savedDatasetsRaw = localStorage.getItem(datasetsKey);
        
        if (activeFileName && savedDatasetsRaw) {
          const datasets = JSON.parse(savedDatasetsRaw);
          const parsedData = datasets[activeFileName];
          if (parsedData) {
            setData(parsedData);
            setFileName(activeFileName);
            if (parsedData.length > 0) {
              const firstRow = parsedData[0];
              const cols = Object.keys(firstRow);
              setColumns(cols);
            }
          }
        } else {
          setData([]);
          setColumns([]);
          setFileName('');
          setXAxis('');
          setYAxis('');
          setAISuggestions([]);
        }

        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.error("Failed to load data from local storage", e);
        localStorage.removeItem(datasetsKey);
        localStorage.removeItem(activeFileNameKey);
        localStorage.removeItem(historyKey);
        setData([]);
        setColumns([]);
        setFileName('');
        setXAxis('');
        setYAxis('');
        setAISuggestions([]);
        setHistory([]);
      }
    } else {
      setData([]);
      setColumns([]);
      setFileName('');
      setXAxis('');
      setYAxis('');
      setAISuggestions([]);
      setHistory([]);
    }
  }, [user]);

  useEffect(() => {
    const fileNameParam = searchParams.get('fileName');
    if (!fileNameParam) {
      if (columns.length > 0 && !xAxis && !yAxis) {
          setXAxis(columns[0] || '');
          setYAxis(columns[1] || '');
      }
      return;
    }

    if (fileNameParam !== fileName) {
      if (!user) {
        router.replace('/', { scroll: false });
        return;
      }
      try {
        const datasetsKey = `datavis-canvas-datasets-${user.email}`;
        const savedDatasetsRaw = localStorage.getItem(datasetsKey);
        const datasets = savedDatasetsRaw ? JSON.parse(savedDatasetsRaw) : {};
        const dataToLoad = datasets[fileNameParam];
        
        if (!dataToLoad) {
          toast({
            variant: 'destructive',
            title: 'File Mismatch',
            description: `Please upload "${fileNameParam}" to load this analysis.`,
          });
          router.replace('/', { scroll: false });
          return;
        }
        
        setData(dataToLoad);
        setFileName(fileNameParam);
        const newColumns = dataToLoad.length > 0 ? Object.keys(dataToLoad[0]) : [];
        setColumns(newColumns);
        localStorage.setItem(`datavis-canvas-active-filename-${user.email}`, fileNameParam);
      } catch(e) {
        console.error("Failed to load dataset from storage", e);
        toast({
          variant: 'destructive',
          title: 'Error Loading Data',
          description: 'Could not load data from browser storage. It might be corrupted.',
        });
        router.replace('/', { scroll: false });
        return;
      }
    }

    const chartTypeParam = searchParams.get('chartType');
    const chartDimensionParam = searchParams.get('chartDimension') as '2d' | '3d' | null;
    const xAxisParam = searchParams.get('xAxis');
    const yAxisParam = searchParams.get('yAxis');

    if (chartTypeParam) setChartType(chartTypeParam);
    if (chartDimensionParam) setChartDimension(chartDimensionParam);
    if (xAxisParam) setXAxis(xAxisParam);
    if (yAxisParam) setYAxis(yAxisParam);

    if(chartTypeParam || xAxisParam || yAxisParam) {
      toast({
        title: 'Analysis Loaded',
        description: `Restored chart settings for "${fileNameParam}".`,
      });
    }
    
    router.replace('/', { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, toast, user]);


  const handleDataUpload = (workbook: WorkBook, name: string) => {
    if (!user) return;
    try {
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet);

      const datasetsKey = `datavis-canvas-datasets-${user.email}`;
      const savedDatasetsRaw = localStorage.getItem(datasetsKey);
      const datasets = savedDatasetsRaw ? JSON.parse(savedDatasetsRaw) : {};
      
      datasets[name] = jsonData;
      localStorage.setItem(datasetsKey, JSON.stringify(datasets));
      localStorage.setItem(`datavis-canvas-active-filename-${user.email}`, name);

      setData(jsonData);
      setFileName(name);
      
      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const cols = Object.keys(firstRow);
        setColumns(cols);
        setXAxis(cols[0] || '');
        setYAxis(cols[1] || '');
      } else {
        setColumns([]);
        setXAxis('');
        setYAxis('');
      }
      
      toast({
        title: "Success",
        description: `Successfully parsed "${name}".`,
      });
      setAISuggestions([]);

    } catch (e) {
      console.error(e);
      const err = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error parsing file",
        description: err,
      });
    }
  };

  const dataSummary = useMemo(() => {
    if (data.length === 0) return '';
    const first5Rows = data.slice(0, 5);
    return `The data has the following columns: ${columns.join(', ')}. Here are the first 5 rows: ${JSON.stringify(first5Rows)}`;
  }, [data, columns]);

  const handleGetSuggestions = async () => {
    if (!dataSummary) {
      toast({
        variant: "destructive",
        title: "No data available",
        description: "Please upload a file first to get suggestions.",
      });
      return;
    }
    
    setIsAISuggestionsLoading(true);
    setAISuggestions([]);
    try {
      const result = await suggestChartTypes({ dataSummary });
      if(result.suggestions) {
        setAISuggestions(result.suggestions);
      }
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Error",
        description: "Could not fetch suggestions from the AI.",
      });
    } finally {
      setIsAISuggestionsLoading(false);
    }
  };

  const handleClearData = () => {
    if (!user) return;

    const datasetsKey = `datavis-canvas-datasets-${user.email}`;
    if (fileName) {
      const savedDatasetsRaw = localStorage.getItem(datasetsKey);
      const datasets = savedDatasetsRaw ? JSON.parse(savedDatasetsRaw) : {};
      delete datasets[fileName];
      localStorage.setItem(datasetsKey, JSON.stringify(datasets));
    }
    
    setData([]);
    setColumns([]);
    setFileName('');
    setXAxis('');
    setYAxis('');
    setAISuggestions([]);
    localStorage.removeItem(`datavis-canvas-active-filename-${user.email}`);
    toast({
      title: "Data Cleared",
      description: "Current data and chart settings have been cleared.",
    });
  }

  const handleSaveAnalysis = () => {
    if (!user) return;
    if (!fileName || !chartType || !xAxis || !yAxis) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Analysis',
        description: 'Please make sure you have data loaded and chart axes selected.',
      });
      return;
    }
    const newEntry: HistoryEntry = {
      id: new Date().toISOString(),
      timestamp: Date.now(),
      fileName,
      chartType,
      chartDimension,
      xAxis,
      yAxis,
    };
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(`datavis-canvas-history-${user.email}`, JSON.stringify(updatedHistory));
    toast({
      title: 'Analysis Saved',
      description: 'Your chart configuration has been saved to history.',
    });
  };

  const handleDownload = (format: 'png' | 'pdf') => {
    if (chartContainerRef.current === null) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Chart element not found.",
      });
      return;
    }

    const downloadToast = toast({
      title: 'Preparing Download',
      description: `Generating ${format.toUpperCase()} file...`,
    });

    htmlToImage.toPng(chartContainerRef.current, { cacheBust: true, skipFonts: true })
      .then((dataUrl) => {
        const safeFileName = fileName.split('.')[0] || 'chart';
        if (format === 'png') {
          const link = document.createElement('a');
          link.download = `${safeFileName}-${chartType}-chart.png`;
          link.href = dataUrl;
          link.click();
          downloadToast.update({
            id: downloadToast.id,
            title: 'Download Complete',
            description: 'Your PNG has been downloaded.',
          });
        } else if (format === 'pdf') {
          const pdf = new jsPDF();
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(dataUrl, 'PNG', 10, 10, pdfWidth, pdfHeight);
          pdf.save(`${safeFileName}-${chartType}-chart.pdf`);
          downloadToast.update({
            id: downloadToast.id,
            title: 'Download Complete',
            description: 'Your PDF has been downloaded.',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to download chart:', err);
        downloadToast.update({
          id: downloadToast.id,
          variant: 'destructive',
          title: 'Download Failed',
          description: 'Could not generate the file. Try again.',
        });
      });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <DataUploader 
              onDataUploaded={handleDataUpload}
              onGetSuggestions={handleGetSuggestions}
              isLoading={isAISuggestionsLoading}
              onClear={handleClearData}
              fileName={fileName}
            />
            {fileName && (
              <AISuggestions 
                suggestions={aiSuggestions}
                isLoading={isAISuggestionsLoading}
              />
            )}
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Data Visualization</CardTitle>
                  <CardDescription>Select your chart type and axes to visualize the data.</CardDescription>
                </div>
                {data.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSaveAnalysis}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Analysis
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download Chart
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload('png')}>Download as PNG</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload('pdf')}>Download as PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {data.length > 0 ? (
                  <>
                    <ChartOptions
                      columns={columns}
                      chartType={chartType}
                      onChartTypeChange={setChartType}
                      chartDimension={chartDimension}
                      onChartDimensionChange={setChartDimension}
                      xAxis={xAxis}
                      onXAxisChange={setXAxis}
                      yAxis={yAxis}
                      onYAxisChange={setYAxis}
                    />
                    <div className="h-[400px] w-full">
                      <ChartDisplay
                        ref={chartContainerRef}
                        data={data}
                        chartType={chartType}
                        chartDimension={chartDimension}
                        xAxis={xAxis}
                        yAxis={yAxis}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-lg bg-card">
                     <p className="text-muted-foreground">Upload a file to start visualizing your data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Showing the first 100 rows of your dataset: {fileName}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={data.slice(0, 100)} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

    