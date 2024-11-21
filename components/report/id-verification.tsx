import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface IdVerificationProps {
  data: {
    name: string;
    address: string;
    gender: string;
    dateOfBirth: string;
    fatherName: string;
    photoMatch: boolean;
    idMatch: boolean;
  };
}

export function IdVerification({ data }: IdVerificationProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          ID verification data not available
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ID Verification Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold">Personal Information</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd>{data.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Address</dt>
                <dd>{data.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Gender</dt>
                <dd>{data.gender}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                <dd>{data.dateOfBirth}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Father's Name</dt>
                <dd>{data.fatherName}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-semibold">Verification Status</h3>
            <div className="mt-2 space-y-4">
              <div className="flex items-center gap-2">
                {data.photoMatch ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Photo Match</span>
                <Badge variant={data.photoMatch ? 'secondary' : 'destructive'}>
                  {data.photoMatch ? 'Matched' : 'Not Matched'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {data.idMatch ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>ID Information</span>
                <Badge variant={data.idMatch ? 'secondary' : 'destructive'}>
                  {data.idMatch ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
