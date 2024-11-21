import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CourtRecord {
  court: string;
  caseNumber: string;
  type: string;
  status: string;
  date: string;
}

interface CourtRecordsProps {
  data: {
    records: CourtRecord[];
    defaulterLists: {
      source: string;
      status: string;
      details?: string;
    }[];
  };
}

export function CourtRecords({ data }: CourtRecordsProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Court records data not available
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Court Records</CardTitle>
        </CardHeader>
        <CardContent>
          {data.records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Court</TableHead>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.court}</TableCell>
                    <TableCell>{record.caseNumber}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === 'Closed' ? 'secondary' : 'outline'
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">
              No court records found
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defaulter Lists</CardTitle>
        </CardHeader>
        <CardContent>
          {data.defaulterLists.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.defaulterLists.map((list, index) => (
                  <TableRow key={index}>
                    <TableCell>{list.source}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          list.status === 'Clear' ? 'secondary' : 'destructive'
                        }
                      >
                        {list.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{list.details || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">
              No defaulter records found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
