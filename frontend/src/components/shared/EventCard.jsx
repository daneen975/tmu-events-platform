import { Link } from 'react-router-dom';

function EventCard({ event }) {
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              event.isFull
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {event.isFull ? 'Full' : `${event.spotsRemaining} spots left`}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-semibold mr-2">📅</span>
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-semibold mr-2">🕐</span>
            {event.startTime} - {event.endTime}
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-semibold mr-2">📍</span>
            {event.location}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          to={`/events/${event._id}`}
          className="block w-full text-center bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition font-semibold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default EventCard;