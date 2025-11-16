import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            MUES Events
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-md hover:bg-blue-800 transition"
            >
              Browse Events
            </Link>
            <Link
              to="/my-events"
              className="px-3 py-2 rounded-md hover:bg-blue-800 transition"
            >
              My Events
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;