import { useState } from 'react';
import { registrationAPI } from '../utils/api';

function MyEvents() {
  const [email, setEmail] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const response = await registrationAPI.getByEmail(email);
      setRegistrations(response.data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">
          View your registered events and QR codes
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your TMU email"
            required
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'View My Events'}
          </button>
        </form>
      </div>

      {searched && !loading && (
        <>
          {registrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-xl text-gray-600">
                No registrations found for this email.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => (
                <div
                  key={registration._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {registration.eventId?.title || 'Event'}
                      </h2>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700">
                          <span className="font-semibold mr-2">📅</span>
                          {formatDate(registration.eventId?.date)}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <span className="font-semibold mr-2">🕐</span>
                          {registration.eventId?.startTime} -{' '}
                          {registration.eventId?.endTime}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <span className="font-semibold mr-2">📍</span>
                          {registration.eventId?.location}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            registration.checkedIn
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {registration.checkedIn
                            ? '✓ Checked In'
                            : 'Not Checked In'}
                        </span>
                        <span className="text-sm text-gray-600">
                          Registered:{' '}
                          {new Date(
                            registration.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="md:ml-6 text-center">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Your QR Code
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          Show this at the event
                        </p>
                        <div className="bg-white p-3 rounded border-2 border-blue-900">
                          <p className="text-xs font-mono break-all text-gray-800">
                            {registration.qrCode}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Check your email for the QR code image
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyEvents;