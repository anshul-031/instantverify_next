interface DocumentInstructionsProps {
  acceptedTypes: string[];
  maxSize: number;
}

export function DocumentInstructions({ acceptedTypes, maxSize }: DocumentInstructionsProps) {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb}MB`;
  };

  const formatFileTypes = (types: string[]) => {
    return types.map(type => type.split('/')[1].toUpperCase()).join(', ');
  };

  return (
    <div className="rounded-lg border bg-muted/50 p-4 text-sm">
      <h4 className="mb-2 font-medium">Document Guidelines:</h4>
      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
        <li>Document should be original and valid</li>
        <li>All text should be clearly visible</li>
        <li>No blurry or unclear images</li>
        <li>Maximum file size: {formatFileSize(maxSize)}</li>
        <li>Supported formats: {formatFileTypes(acceptedTypes)}</li>
      </ul>
    </div>
  );
}