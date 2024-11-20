import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface LocationInfoProps {
  data: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
}

declare global {
  interface Window {
    google: any;
  }
}

export function LocationInfo({ data }: LocationInfoProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !mapRef.current) return;

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: data.latitude, lng: data.longitude },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat: data.latitude, lng: data.longitude },
        map,
        title: "Verification Location",
      });
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [data]);

  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Location data not available
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Address</h3>
          <p className="mt-1 text-muted-foreground">{data.address}</p>
        </div>
        <div>
          <h3 className="font-semibold">Timestamp</h3>
          <p className="mt-1 text-muted-foreground">{data.timestamp}</p>
        </div>
        <div>
          <h3 className="font-semibold">Map</h3>
          <div
            ref={mapRef}
            className="mt-2 h-[300px] w-full rounded-md border"
          />
        </div>
      </CardContent>
    </Card>
  );
}