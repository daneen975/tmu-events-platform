import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../utils/api';

function AdminEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchEventAndRegistrations();
  }, [id]);

  const fetchEventAndRegistrations = async () => {
    try {
      const [eventRes, regRes] = await Promise.all([
        eventAPI.getById(id),
        registrationAPI.getByEvent(id),
      ]);
      setEvent(eventRes.data);
      setRegistrations(regRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setCheckingIn(true);
    try {
      const response = await registrationAPI.checkIn(qrCode.trim());
      alert(`✅ ${response.data.message}\n\nStudent: ${response.data.student.name}`);
      
      // Refresh registrations to show updated check-in status
      const regRes = await registrationAPI.getByEvent(id);
      setRegistrations(regRes.data);
      setQrCode('');
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
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

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Program', 'Student Number', 'Phone', 'Registered At', 'Checked In'];
    const rows = registrations.map(reg => [
      reg.studentName,
      reg.studentEmail,
      reg.program,
      reg.studentNumber || 'N/A',
      reg.phoneNumber || 'N/A',
      new Date(reg.createdAt).toLocaleString(),
      reg.checkedIn ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Event not found</div>
      </div>
    );
  }

  const checkedInCount = registrations.filter(r => r.checkedIn).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <div className="space-y-2">
                <p className="text-gray-700">📅 {formatDate(event.date)}</p>
                <p className="text-gray-700">🕐 {event.startTime} - {event.endTime}</p>
                <p className="text-gray-700">📍 {event.location}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                event.status === 'published' ? 'bg-green-100 text-green-800' :
                event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Total Registered</p>
              <p className="text-2xl font-bold text-blue-900">{registrations.length} / {event.capacity}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Checked In</p>
              <p className="text-2xl font-bold text-green-900">{checkedInCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600">Check-in Rate</p>
              <p className="text-2xl font-bold text-purple-900">
                {registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Scanner */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code Check-In</h2>
          <form onSubmit={handleCheckIn} className="flex gap-4">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Scan or enter QR code"
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={checkingIn || !qrCode.trim()}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {checkingIn ? 'Checking In...' : 'Check In'}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-2">
            💡 Tip: Click the input field and scan the student's QR code, then press Enter
          </p>
        </div>

        {/* Registrations List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Registrations ({registrations.length})
            </h2>
            {registrations.length > 0 && (
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                📥 Export CSV
              </button>
            )}
          </div>

          {registrations.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No registrations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg._id} className={reg.checkedIn ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reg.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reg.studentEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reg.program}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reg.checkedIn ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Not Checked In
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminEventDetails;