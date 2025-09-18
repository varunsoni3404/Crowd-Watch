import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';

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

// Component to handle map layers (clustering, heatmap, and bounds)
const MapLayers = ({ reports, showClusters, showHeatmap }) => {
  const map = useMap();

  useEffect(() => {
    const validReports = reports.filter(report => 
      report.location && 
      report.location.latitude && 
      report.location.longitude
    );

    if (validReports.length === 0) return;

    let markerClusterGroup = null;
    let heatmapLayer = null;
    let individualMarkers = [];

    // Create clustered markers
    if (showClusters) {
      markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let size = 'small';
          
          if (count < 10) {
            size = 'small';
          } else if (count < 100) {
            size = 'medium';
          } else {
            size = 'large';
          }

          return new L.DivIcon({
            html: `<div style="
              background-color: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              font-size: ${size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px'};
              width: ${size === 'small' ? '30px' : size === 'medium' ? '35px' : '40px'};
              height: ${size === 'small' ? '30px' : size === 'medium' ? '35px' : '40px'};
            ">${count}</div>`,
            className: 'marker-cluster',
            iconSize: new L.Point(
              size === 'small' ? 30 : size === 'medium' ? 35 : 40, 
              size === 'small' ? 30 : size === 'medium' ? 35 : 40
            ),
          });
        }
      });

      validReports.forEach((report) => {
        const marker = L.marker(
          [report.location.latitude, report.location.longitude],
          { icon: createCustomIcon(report.status) }
        );

        // Create popup content
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center space-x-2 mb-2">
              <h3 class="font-semibold text-gray-900 text-sm">${report.title}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full ${
                report.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }">
                ${report.status}
              </span>
            </div>
            
            <div class="space-y-1 text-xs text-gray-600">
              <div><strong>Category:</strong> ${report.category}</div>
              <div><strong>User:</strong> ${report.userId?.username || 'Unknown'}</div>
              <div><strong>Submitted:</strong> ${new Date(report.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
              ${report.location?.address ? `<div><strong>Address:</strong> ${report.location.address}</div>` : ''}
            </div>
            
            <p class="text-xs text-gray-700 mt-2">${report.description}</p>
            
            ${report.photoUrl ? `
              <div class="mt-2">
                <img
                  src="${import.meta.env.VITE_BASE_URL}${report.photoUrl}"
                  alt="Report"
                  class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                  onclick="window.open('${import.meta.env.VITE_BASE_URL}${report.photoUrl}', '_blank')"
                />
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        markerClusterGroup.addLayer(marker);
      });

      map.addLayer(markerClusterGroup);
    } else {
      // Add individual markers when clustering is disabled
      validReports.forEach((report) => {
        const marker = L.marker(
          [report.location.latitude, report.location.longitude],
          { icon: createCustomIcon(report.status) }
        );

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center space-x-2 mb-2">
              <h3 class="font-semibold text-gray-900 text-sm">${report.title}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full ${
                report.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }">
                ${report.status}
              </span>
            </div>
            
            <div class="space-y-1 text-xs text-gray-600">
              <div><strong>Category:</strong> ${report.category}</div>
              <div><strong>User:</strong> ${report.userId?.username || 'Unknown'}</div>
              <div><strong>Submitted:</strong> ${new Date(report.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
              ${report.location?.address ? `<div><strong>Address:</strong> ${report.location.address}</div>` : ''}
            </div>
            
            <p class="text-xs text-gray-700 mt-2">${report.description}</p>
            
            ${report.photoUrl ? `
              <div class="mt-2">
                <img
                  src="${import.meta.env.VITE_BASE_URL}${report.photoUrl}"
                  alt="Report"
                  class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                  onclick="window.open('${import.meta.env.VITE_BASE_URL}${report.photoUrl}', '_blank')"
                />
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
        individualMarkers.push(marker);
      });
    }

    // Create heatmap layer
    if (showHeatmap) {
      const heatmapData = validReports.map((report) => {
        // Assign intensity based on status (unresolved issues get higher intensity)
        const intensity = report.status === 'Resolved' ? 0.3 : 
                         report.status === 'In Progress' ? 0.7 : 1.0;
        
        return [
          report.location.latitude,
          report.location.longitude,
          intensity
        ];
      });

      heatmapLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: '#3b82f6',  // blue for low intensity
          0.4: '#f59e0b',  // yellow for medium intensity
          0.6: '#f97316',  // orange for high intensity
          1.0: '#dc2626'   // red for highest intensity
        }
      });

      map.addLayer(heatmapLayer);
    }

    // Fit bounds to show all markers
    if (validReports.length > 0) {
      const bounds = L.latLngBounds(
        validReports.map(report => [
          report.location.latitude,
          report.location.longitude
        ])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Cleanup function
    return () => {
      if (markerClusterGroup) {
        map.removeLayer(markerClusterGroup);
      }
      if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
      }
      individualMarkers.forEach(marker => {
        map.removeLayer(marker);
      });
    };
  }, [reports, map, showClusters, showHeatmap]);

  return null;
};

// Map controls component
const MapControls = ({ showClusters, setShowClusters, showHeatmap, setShowHeatmap }) => {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] space-y-2">
      <div className="text-sm font-semibold text-gray-700 mb-2">Map Options</div>
      
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showClusters}
          onChange={(e) => setShowClusters(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Cluster Markers</span>
      </label>
      
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={(e) => setShowHeatmap(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Show Heatmap</span>
      </label>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Submitted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsMap = ({ reports, height = '400px' }) => {
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [showClusters, setShowClusters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

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
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapLayers 
          reports={validReports} 
          showClusters={showClusters}
          showHeatmap={showHeatmap}
        />
      </MapContainer>
      
      <MapControls 
        showClusters={showClusters}
        setShowClusters={setShowClusters}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
      />
    </div>
  );
};

export default ReportsMap;