import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Search } from 'lucide-react';

export default function ResponderDashboard() {
    const navigate = useNavigate();
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // In a full implementation, we'd poll or use WebSockets to get list of open alerts
    // and filter by radius (PostGIS). For MVP, we mock the fetch.
    useEffect(() => {
        // Mocking an active alert fetch
        setTimeout(() => {
            setActiveAlerts([
                {
                    id: 'test-uuid-1234',
                    symptoms: "Severe chest pain, trouble breathing",
                    distance: "0.5 miles away",
                    time: "2 mins ago"
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const acceptAlert = (id) => {
        // In real app, POST /alerts/accept
        navigate(`/patient/active/${id}`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border text-gray-800 p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Responder Dashboard
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Status: Online and scanning area</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Nearby Active Emergencies</h3>
                    {loading && <Search className="w-5 h-5 text-gray-400 animate-spin" />}
                </div>

                <div className="divide-y divide-gray-100">
                    {activeAlerts.length === 0 && !loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No active emergencies in your area.</p>
                        </div>
                    ) : (
                        activeAlerts.map(alert => (
                            <div key={alert.id} className="p-6 hover:bg-red-50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-red-500">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">High Priority</span>
                                        <span className="text-sm text-gray-500">{alert.time}</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 mb-1">"{alert.symptoms}"</p>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-1 pb-0.5 text-gray-400" />
                                        {alert.distance}
                                    </div>
                                </div>
                                <button
                                    onClick={() => acceptAlert(alert.id)}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-transform active:scale-95"
                                >
                                    Respond Now
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
