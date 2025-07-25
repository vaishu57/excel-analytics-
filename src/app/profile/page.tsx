'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import AnalysisHistory from '@/components/AnalysisHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type HistoryEntry = {
  id: string;
  timestamp: number;
  fileName: string;
  chartType: string;
  chartDimension: '2d' | '3d';
  xAxis: string;
  yAxis: string;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const historyKey = `datavis-canvas-history-${user.email}`;
      try {
        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error("Failed to load history from local storage", e);
        localStorage.removeItem(historyKey);
      }
    }
  }, [user]);

  const handleLoadAnalysis = (entry: HistoryEntry) => {
    const params = new URLSearchParams({
        fileName: entry.fileName,
        chartType: entry.chartType,
        chartDimension: entry.chartDimension || '2d',
        xAxis: entry.xAxis,
        yAxis: entry.yAxis,
    });
    router.push(`/?${params.toString()}`);
  };

  const handleDeleteAnalysis = (id: string) => {
    if (!user) return;
    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(`datavis-canvas-history-${user.email}`, JSON.stringify(updatedHistory));
    toast({
      title: 'Analysis Deleted',
      description: 'The saved analysis has been removed from your history.',
    });
  };

  if (loading || !user) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft />
                        <span className="sr-only">Back to Dashboard</span>
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Profile & History</h1>
            </div>

            <Card>
                <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Email: <span className="font-medium text-foreground">{user.email}</span></p>
                  </div>
                </CardContent>
            </Card>

            <AnalysisHistory
                history={history}
                onLoad={handleLoadAnalysis}
                onDelete={handleDeleteAnalysis}
            />

            {history.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>No Saved History</CardTitle>
                        <CardDescription>You haven't saved any analyses yet. Go to the dashboard to create and save a visualization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/">Go to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </div>
  );
}

    