"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  location?: { latitude: number; longitude: number };
  error?: string;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({});

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ error: "Geolocation is not supported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        setState({ error: error.message });
      }
    );
  }, []);

  return state;
}