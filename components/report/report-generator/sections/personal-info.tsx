interface PersonalInfoProps {
  data?: {
    name: string;
    dateOfBirth: string;
    gender: string;
    address: string;
  };
}

export function PersonalInfo({ data }: PersonalInfoProps) {
  if (!data) {
    return (
      <div className="rounded-lg border p-4 text-center text-muted-foreground">
        Personal information not available
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Full Name</p>
          <p className="font-medium">{data.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date of Birth</p>
          <p className="font-medium">{data.dateOfBirth}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Gender</p>
          <p className="font-medium">{data.gender}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Address</p>
          <p className="font-medium">{data.address}</p>
        </div>
      </div>
    </div>
  );
}