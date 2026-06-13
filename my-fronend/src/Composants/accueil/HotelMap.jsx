import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export default function HotelMap({ lat, lng }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  const center = {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };
  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "250px",
        borderRadius: "12px"
      }}
      center={center}
      zoom={15}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}