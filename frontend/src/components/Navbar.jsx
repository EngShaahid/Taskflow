import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();                        // clears localStorage and context
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <h1>TaskFlow</h1>
      <div className="nav-right">
        <span className="user-name">{user?.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;