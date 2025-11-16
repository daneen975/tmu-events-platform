import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../utils/api';
import { TMU_PROGRAMS } from '../utils/constants';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    program: '',
    studentNumber: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getById(id);
      setEvent(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load event details.');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);

    try {
      const response = await registrationAPI.register({
        eventId: id,
        ...formData,
      });

      alert(response.data.message);
      navigate('/my-events');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Registration failed. Please try again.';
      alert(errorMsg);
    } finally {
      setRegistering(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error || 'Event not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {event.title}
          </h1>
          <div className="flex items-center space-x-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                event.isFull
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {event.isFull ? 'Event Full' : `${event.spotsRemaining} spots available`}
            </span>
            <span className="text-gray-600">
              {event.currentRegistrations} / {event.capacity} registered
            </span>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-center text-lg">
            <span className="font-semibold mr-3">📅 Date:</span>
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-lg">
            <span className="font-semibold mr-3">🕐 Time:</span>
            {event.startTime} - {event.endTime}
          </div>
          <div className="flex items-center text-lg">
            <span className="font-semibold mr-3">📍 Location:</span>
            {event.location}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.programs && event.programs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Open to Programs</h3>
            <div className="flex flex-wrap gap-2">
              {event.programs.map((program, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  {program}
                </span>
              ))}
            </div>
          </div>
        )}

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            disabled={event.isFull}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
              event.isFull
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {event.isFull ? 'Event Full' : 'Register for Event'}
          </button>
        ) : (
          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Registration Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  TMU Email *
                </label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john.doe@torontomu.ca"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Program *
                </label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your program</option>
                  {TMU_PROGRAMS.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Student Number (Optional)
                </label>
                <input
                  type="text"
                  name="studentNumber"
                  value={formData.studentNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="416-123-4567"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex-1 py-3 px-6 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-gray-400"
                >
                  {registering ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;