import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// مركز افتراضي (فاس مثلاً) باش الماب ما تخرجش في البحر
const mapCenter = { lat: 34.0331, lng: -5.0003 };

function MapComponent({ groups }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      // جرب تبدل السنتر لـ mapCenter باش يركز على بلاصة فيها الـ Satellite باين
      center={mapCenter} 
      zoom={12}
      options={{ 
        // ❌ حيد disableDefaultUI أو ردها false باش يبانو الأزرار
        disableDefaultUI: false, 
        // ✅ فعل هادي باش ترجع الزر ديال Map/Satellite
        mapTypeControl: true,
        // ستايل اختياري باش تحيد الـ POIs (الحوانت والقهوات) وتبقى الخريطة نقية
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] }
        ]
      }}
    >
      {groups.map(group => (
        group.latitude && group.longitude && (
          <Marker 
            key={group.id} 
            position={{ 
                lat: parseFloat(group.latitude), 
                lng: parseFloat(group.longitude) 
            }}
            onClick={() => setSelectedGroup(group)}
          />
        )
      ))}

      {selectedGroup && (
        <InfoWindow
          position={{ 
            lat: parseFloat(selectedGroup.latitude), 
            lng: parseFloat(selectedGroup.longitude) 
          }}
          onCloseClick={() => setSelectedGroup(null)}
        >
          <div style={{ padding: '5px', maxWidth: '150px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px', color: '#ff2d55' }}>{selectedGroup.name}</h4>
            <p style={{ margin: '0', fontSize: '12px' }}>📍 {selectedGroup.lieu_event}</p>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>👥 {selectedGroup.users_count}/5</p>
            <button 
              className="rejoindre-btn-green_grp"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => alert('Détails de ' + selectedGroup.name)}
            >
              Voir Plus
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default React.memo(MapComponent);