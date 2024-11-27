import { Progress } from "@/components/ui/progress";

interface BiometricInfoProps {
  personPhoto: string;
  documentPhoto?: string;
  matchScore?: number;
}

export function BiometricInfo({ personPhoto, documentPhoto, matchScore }: BiometricInfoProps) {
  return (
    <div className="space-y-6 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-medium">Live Photo</p>
          <div className="aspect-square overflow-hidden rounded-lg">
            <img src={personPhoto} alt="Person" className="h-full w-full object-cover" />
          </div>
        </div>
        {documentPhoto && (
          <div>
            <p className="mb-2 font-medium">Document Photo</p>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img src={documentPhoto} alt="Document" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>

      {typeof matchScore === 'number' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">Face Match Score</p>
            <span className="text-sm">{matchScore}%</span>
          </div>
          <Progress value={matchScore} />
        </div>
      )}
    </div>
  );
}