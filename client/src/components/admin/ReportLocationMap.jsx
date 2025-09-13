import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportLocationMap = ({ report, height = '200px' }) => {
  if (!report.location || !report.location.latitude || !report.location.longitude) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-sm">No location data</p>
        </div>
      </div>
    );
  }

  const { latitude, longitude } = report.location;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="p-2 min-w-[150px]">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.title}</h3>
              <div className="text-xs text-gray-600">
                <div><strong>Status:</strong> {report.status}</div>
                <div><strong>Category:</strong> {report.category}</div>
                {/* <div><strong>Coordinates:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}</div> */}
                {report.location?.address && (
                  <div><strong>Address:</strong> {report.location.address}</div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ReportLocationMap;
