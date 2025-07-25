"use client";

import type { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface DataUploaderProps {
  onDataUploaded: (workbook: XLSX.WorkBook, name: string) => void;
  onGetSuggestions: () => void;
  isLoading: boolean;
  onClear: () => void;
  fileName: string | null;
}

export default function DataUploader({ onDataUploaded, onGetSuggestions, isLoading, onClear, fileName }: DataUploaderProps) {
  const { toast } = useToast();
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (typeof data !== 'string' && !data) throw new Error("Could not read file");
          const workbook = XLSX.read(data, { type: 'binary' });
          onDataUploaded(workbook, file.name);
        } catch (error) {
          const err = error instanceof Error ? error.message : "An unexpected error occurred."
          toast({
            variant: "destructive",
            title: "File Read Error",
            description: err,
          });
        }
      };
      reader.readAsBinaryString(file);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Data</CardTitle>
        <CardDescription>Upload an Excel file (.xls, .xlsx) to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="excel-file">Excel File</Label>
          <div className="flex items-center gap-2">
            <Input id="excel-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="cursor-pointer file:text-primary file:font-semibold" />
          </div>
        </div>
        {fileName && <p className="text-sm text-muted-foreground">Loaded: <strong className="text-foreground">{fileName}</strong></p>}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <Button onClick={onGetSuggestions} disabled={isLoading || !fileName}>
          <Lightbulb className="mr-2 h-4 w-4" />
          {isLoading ? "Analyzing..." : "Get AI Suggestions"}
        </Button>
        {fileName && (
          <Button variant="outline" onClick={onClear}>
            <XCircle className="mr-2 h-4 w-4" />
            Clear Data
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
