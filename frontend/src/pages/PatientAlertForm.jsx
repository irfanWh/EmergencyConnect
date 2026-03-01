import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Send } from 'lucide-react';

export default function PatientAlertForm() {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);

    // In a real app we'd get native geolocation, mock for MVP
    const mockLat = 40.7128;
    const mockLng = -74.0060;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Hardcoded backend URL for local testing, would be in .env
            const response = await fetch('http://localhost:8000/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms,
                    latitude: mockLat,
                    longitude: mockLng,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit alert');

            const data = await response.json();

            // Navigate to the active tracking page
            navigate(`/patient/active/${data.id}`);
        } catch (error) {
            console.error(error);
            alert("Error submitting emergency alert.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-red-600 p-6 text-center text-white">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-3xl font-extrabold tracking-tight">Request Help Now</h2>
                    <p className="mt-2 text-red-100 font-medium">An AI will guide you while responders are dispatched.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What are the symptoms or emergency?
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow resize-none"
                            placeholder="e.g., Severe chest pain, trouble breathing, bleeding from arm..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 mr-2 text-red-500" />
                        <span>Location automatically securely attached.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || symptoms.trim() === ''}
                        className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Submitting Alert...' : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                SEND ALERT NOW
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
