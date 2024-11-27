interface DocumentInfoProps {
  image: string;
  data?: {
    issuedBy: string;
    issuedDate: string;
    expiryDate?: string;
    verificationSource: string;
  };
}

export function DocumentInfo({ image, data }: DocumentInfoProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="aspect-video overflow-hidden rounded-lg">
        <img src={image} alt="Document" className="h-full w-full object-cover" />
      </div>

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Issued By</p>
            <p className="font-medium">{data.issuedBy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Issue Date</p>
            <p className="font-medium">{data.issuedDate}</p>
          </div>
          {data.expiryDate && (
            <div>
              <p className="text-sm text-muted-foreground">Expiry Date</p>
              <p className="font-medium">{data.expiryDate}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Verification Source</p>
            <p className="font-medium">{data.verificationSource}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          Document information not available
        </div>
      )}
    </div>
  );
}