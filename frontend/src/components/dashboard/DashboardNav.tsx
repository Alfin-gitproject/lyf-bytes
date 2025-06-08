// src/components/othersPages/dashboard/DashboardNav.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/features/userSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { RootState } from "../../store/store";

const accountLinks = [
  { href: "/my-account", label: "Dashboard" },
  { href: "/my-account-orders", label: "Orders" },
  { href: "/my-account-address", label: "Addresses" },
  { href: "/my-account-edit", label: "Account Details" },
  { href: "/my-account-wishlist", label: "Wishlist" },
];

export default function DashboardNav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post("/api/auth/logout", {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      dispatch(clearUser());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <ul className="my-account-nav">
      {accountLinks.map((link, index) => (
        <li key={index}>
          <Link
            to={link.href}
            className={`my-account-nav-item ${location.pathname === link.href ? "active" : ""}`}
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "transparent",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          className="my-account-nav-item"
          disabled={isLoading}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </li>
    </ul>
  );
}