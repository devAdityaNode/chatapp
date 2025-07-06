import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 px-6 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-bold text-primary">ChatVerse</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="btn btn-outline btn-primary">Login</Link>
        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
      </div>
    </div>
  );
};

export default Navbar;
