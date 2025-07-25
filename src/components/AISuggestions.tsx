import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ChevronsRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface AISuggestionsProps {
  suggestions: string[];
  isLoading: boolean;
}

export default function AISuggestions({ suggestions, isLoading }: AISuggestionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
          <CardDescription>Analyzing your data for visualization ideas...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
          AI Suggestions
        </CardTitle>
        <CardDescription>Here are some ideas for visualizing your data:</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start text-sm">
              <ChevronsRight className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
