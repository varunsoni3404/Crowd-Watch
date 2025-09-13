import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on report status
const createCustomIcon = (status) => {
  const getColor = (status) => {
    switch (status) {
      case 'Submitted':
        return '#f59e0b'; // yellow
      case 'In Progress':
        return '#3b82f6'; // blue
      case 'Resolved':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${getColor(status)};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">${status.charAt(0)}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to fit map bounds to show all markers
const FitBounds = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const validReports = reports.filter(report => 
        report.location && 
        report.location.latitude && 
        report.location.longitude
      );

      if (validReports.length > 0) {
        const bounds = L.latLngBounds(
          validReports.map(report => [
            report.location.latitude,
            report.location.longitude
          ])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [reports, map]);

  return null;
};

const ReportsMap = ({ reports, height = '400px' }) => {
  const [mapCenter, setMapCenter] = useState([0, 0]);

  useEffect(() => {
    if (reports.length > 0) {
      const validReports = reports.filter(report => 
        report.location && 
        report.location.latitude && 
        report.location.longitude
      );

      if (validReports.length > 0) {
        // Calculate center point
        const avgLat = validReports.reduce((sum, report) => sum + report.location.latitude, 0) / validReports.length;
        const avgLng = validReports.reduce((sum, report) => sum + report.location.longitude, 0) / validReports.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [reports]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validReports = reports.filter(report => 
    report.location && 
    report.location.latitude && 
    report.location.longitude
  );

  if (validReports.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p>No reports with location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds reports={validReports} />
        
        {validReports.map((report) => (
          <Marker
            key={report._id}
            position={[report.location.latitude, report.location.longitude]}
            icon={createCustomIcon(report.status)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{report.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div><strong>Category:</strong> {report.category}</div>
                  <div><strong>User:</strong> {report.userId?.username || 'Unknown'}</div>
                  <div><strong>Submitted:</strong> {formatDate(report.createdAt)}</div>
                  {report.location?.address && (
                    <div><strong>Address:</strong> {report.location.address}</div>
                  )}
                  {/* <div><strong>Coordinates:</strong> {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}</div> */}
                </div>
                
                <p className="text-xs text-gray-700 mt-2 line-clamp-2">{report.description}</p>
                
                {report.photoUrl && (
                  <div className="mt-2">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${report.photoUrl}`}
                      alt="Report"
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                      onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${report.photoUrl}`, '_blank')}
                    />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReportsMap;
