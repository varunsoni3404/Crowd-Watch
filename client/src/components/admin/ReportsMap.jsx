import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';

// --- Fix for default marker icons ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Status config (colors + badges) ---
const STATUS_CONFIG = {
  Submitted: { color: '#f59e0b', badge: 'bg-yellow-100 text-yellow-800' },
  'In Progress': { color: '#3b82f6', badge: 'bg-blue-100 text-blue-800' },
  Resolved: { color: '#10b981', badge: 'bg-green-100 text-green-800' },
  default: { color: '#6b7280', badge: 'bg-gray-100 text-gray-800' },
};

// --- Custom marker icon ---
const createCustomIcon = (status) => {
  const color = STATUS_CONFIG[status]?.color || STATUS_CONFIG.default.color;
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
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
    ">${status?.charAt(0) || '?'}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// --- Popup content generator ---
const getPopupContent = (report) => `
  <div class="p-2 min-w-[200px]">
    <div class="flex items-center space-x-2 mb-2">
      <h3 class="font-semibold text-gray-900 text-sm">${report.title}</h3>
      <span class="px-2 py-1 text-xs font-medium rounded-full ${
        STATUS_CONFIG[report.status]?.badge || STATUS_CONFIG.default.badge
      }">${report.status}</span>
    </div>
    
    <div class="space-y-1 text-xs text-gray-600">
      <div><strong>Category:</strong> ${report.category}</div>
      <div><strong>User:</strong> ${report.userId?.username || 'Unknown'}</div>
      <div><strong>Submitted:</strong> ${new Date(report.createdAt).toLocaleString()}</div>
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

// --- Map layers (clusters + heatmap + fitBounds) ---
const MapLayers = ({ reports, showClusters, showHeatmap }) => {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) return;

    let markerLayer = null;
    let clusterLayer = null;
    let heatmapLayer = null;

    // Clustering enabled
    if (showClusters) {
      clusterLayer = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
          const dim = size === 'small' ? 30 : size === 'medium' ? 35 : 40;

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
              width: ${dim}px;
              height: ${dim}px;
            ">${count}</div>`,
            className: 'marker-cluster',
            iconSize: new L.Point(dim, dim),
          });
        },
      });

      reports.forEach((r) => {
        const marker = L.marker([r.location.latitude, r.location.longitude], {
          icon: createCustomIcon(r.status),
        }).bindPopup(getPopupContent(r));
        clusterLayer.addLayer(marker);
      });

      map.addLayer(clusterLayer);
    } else {
      // Individual markers
      markerLayer = L.layerGroup(
        reports.map((r) =>
          L.marker([r.location.latitude, r.location.longitude], {
            icon: createCustomIcon(r.status),
          }).bindPopup(getPopupContent(r))
        )
      );
      map.addLayer(markerLayer);
    }

    // Heatmap
    if (showHeatmap) {
      const heatmapData = reports.map((r) => {
        const intensity =
          r.status === 'Resolved' ? 0.3 : r.status === 'In Progress' ? 0.7 : 1.0;
        return [r.location.latitude, r.location.longitude, intensity];
      });

      heatmapLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: '#3b82f6',
          0.4: '#f59e0b',
          0.6: '#f97316',
          1.0: '#dc2626',
        },
      });

      map.addLayer(heatmapLayer);
    }

    // Fit map bounds once when reports change
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map((r) => [r.location.latitude, r.location.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Cleanup
    return () => {
      if (clusterLayer) map.removeLayer(clusterLayer);
      if (markerLayer) map.removeLayer(markerLayer);
      if (heatmapLayer) map.removeLayer(heatmapLayer);
    };
  }, [reports, map, showClusters, showHeatmap]);

  return null;
};

// --- Map controls ---
const MapControls = ({ showClusters, setShowClusters, showHeatmap, setShowHeatmap }) => (
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
        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'default').map(([status, { color }]) => (
          <div key={status} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Main component ---
const ReportsMap = ({ reports, height = '400px' }) => {
  const [showClusters, setShowClusters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const validReports = useMemo(
    () => reports.filter((r) => r.location?.latitude && r.location?.longitude),
    [reports]
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
        center={[20, 0]} // fallback center
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapLayers reports={validReports} showClusters={showClusters} showHeatmap={showHeatmap} />
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
