import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../utils/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function Analytics() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsRes = await eventAPI.getAll();
      const events = eventsRes.data;
      setEvents(events);

      // Fetch registrations for each event
      const registrationPromises = events.map((event) =>
        registrationAPI.getByEvent(event._id)
      );
      const registrationsResults = await Promise.all(registrationPromises);

      const allRegs = registrationsResults.flatMap((res, index) =>
        res.data.map((reg) => ({
          ...reg,
          eventTitle: events[index].title,
        }))
      );

      setAllRegistrations(allRegs);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalEvents = events.length;
  const totalRegistrations = allRegistrations.length;
  const totalCheckedIn = allRegistrations.filter((r) => r.checkedIn).length;
  const avgCheckInRate =
    totalRegistrations > 0
      ? Math.round((totalCheckedIn / totalRegistrations) * 100)
      : 0;

  // Program breakdown data
  const programCounts = {};
  allRegistrations.forEach((reg) => {
    programCounts[reg.program] = (programCounts[reg.program] || 0) + 1;
  });

  const programData = Object.entries(programCounts).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value,
  }));

  const COLORS = ['#003262', '#3B7EA1', '#FDB515', '#C4820E', '#859438', '#6C3302'];

  // Event comparison data
  const eventComparisonData = events.map((event) => {
    const eventRegs = allRegistrations.filter((r) => r.eventId === event._id);
    const checkedIn = eventRegs.filter((r) => r.checkedIn).length;

    return {
      name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
      registrations: eventRegs.length,
      checkedIn: checkedIn,
      capacity: event.capacity,
    };
  });

  // Registration timeline (last 30 days)
  const timelineData = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const regsOnDate = allRegistrations.filter((reg) => {
      const regDate = new Date(reg.createdAt).toISOString().split('T')[0];
      return regDate === dateStr;
    }).length;

    timelineData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: regsOnDate,
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your events</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Total Events</p>
            <p className="text-4xl font-bold mt-2">{totalEvents}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Total Registrations</p>
            <p className="text-4xl font-bold mt-2">{totalRegistrations}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Total Check-ins</p>
            <p className="text-4xl font-bold mt-2">{totalCheckedIn}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Avg Check-in Rate</p>
            <p className="text-4xl font-bold mt-2">{avgCheckInRate}%</p>
          </div>
        </div>

        {/* Registration Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Registration Timeline (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#003262"
                strokeWidth={2}
                name="Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Program Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Students by Program
            </h2>
            {programData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={programData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {programData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600 py-12">No data available</p>
            )}
          </div>

          {/* Event Comparison */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Comparison</h2>
            {eventComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="registrations" fill="#003262" name="Registered" />
                  <Bar dataKey="checkedIn" fill="#3B7EA1" name="Checked In" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600 py-12">No events to compare</p>
            )}
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Performance</h2>
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fill Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Checked In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check-in Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => {
                    const eventRegs = allRegistrations.filter(
                      (r) => r.eventId === event._id
                    );
                    const checkedIn = eventRegs.filter((r) => r.checkedIn).length;
                    const fillRate = Math.round(
                      (eventRegs.length / event.capacity) * 100
                    );
                    const checkInRate =
                      eventRegs.length > 0
                        ? Math.round((checkedIn / eventRegs.length) * 100)
                        : 0;

                    return (
                      <tr key={event._id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {event.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {event.capacity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {eventRegs.length}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              fillRate >= 90
                                ? 'bg-red-100 text-red-800'
                                : fillRate >= 70
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {fillRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{checkedIn}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              checkInRate >= 80
                                ? 'bg-green-100 text-green-800'
                                : checkInRate >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {checkInRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No events available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;