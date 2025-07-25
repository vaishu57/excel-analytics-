import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type DataRow = Record<string, string | number>;

interface DataTableProps {
  data: DataRow[];
}

export default function DataTable({ data }: DataTableProps) {
  if (data.length === 0) {
    return <p className="text-muted-foreground">No data to display.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-muted z-10">
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="font-semibold text-foreground">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
