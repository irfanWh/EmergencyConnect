import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldAlert, Activity, Menu, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function ActiveEmergency() {
    const { id } = useParams();
    const [aiGuidance, setAiGuidance] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');

    // Connect to WebSocket on mount
    useEffect(() => {
        // In production, use ws:// or wss:// backend URL from .env
        const ws = new WebSocket(`ws://localhost:8000/ws/${id}`);

        ws.onopen = () => {
            console.log('Connected to emergency room ws');
            setConnectionStatus('Live Connection Established');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("WS Data Received:", message);

            if (message.type === 'AI_UPDATE') {
                setAiGuidance(message.guidance);
            }
        };

        ws.onclose = () => {
            setConnectionStatus('Connection Lost. Reconnecting...');
        };

        return () => {
            ws.close();
        };
    }, [id]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">

            {/* Banner */}
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                    <Activity className="h-6 w-6 text-red-600 animate-pulse mr-3" />
                    <div>
                        <h2 className="text-red-800 font-bold text-lg">Emergency Alert Active</h2>
                        <p className="text-red-600 text-sm">Responders have been notified.</p>
                    </div>
                </div>
                <div className="text-sm font-mono bg-white px-3 py-1 rounded text-gray-500 shadow-sm border border-red-100">
                    ALRT-{id?.substring(0, 6).toUpperCase() || 'UNKNOWN'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Guidance Panel */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-800 p-4 text-white flex items-center">
                        <ShieldAlert className="w-5 h-5 text-blue-400 mr-2" />
                        <h3 className="font-semibold text-lg flex-1">AI First-Aid Guidance</h3>
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                    </div>

                    <div className="p-6">
                        {!aiGuidance ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-gray-400">
                                <Menu className="w-8 h-8 animate-pulse text-gray-300" />
                                <p>Analyzing symptoms and preparing safe guidance...</p>
                            </div>
                        ) : (
                            <div className="prose prose-red max-w-none text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                                {aiGuidance}
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Responder Map UI */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Live Location Tracking</h3>
                        <span className="text-xs text-gray-400 font-mono">{connectionStatus}</span>
                    </div>
                    <div className="flex-1 z-0 relative">
                        <MapContainer
                            center={[40.7128, -74.0060]}
                            zoom={13}
                            scrollWheelZoom={false}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[40.7128, -74.0060]}>
                                <Popup>
                                    Patient Location <br /> ALRT-{id?.substring(0, 4)}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
