export function PhotoInstructions() {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 text-sm">
      <h4 className="mb-2 font-medium">Photo Guidelines:</h4>
      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
        <li>Ensure good lighting and a clear background</li>
        <li>Look directly at the camera</li>
        <li>Remove sunglasses or any face coverings</li>
        <li>Maintain a neutral expression</li>
        <li>Your face should fill about 70-80% of the frame</li>
      </ul>
    </div>
  );
}