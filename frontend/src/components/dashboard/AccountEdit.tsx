"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RootState } from "../../store/store";

export default function AccountEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        "/api/users/profile",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      dispatch(setUser({ ...user, ...response.data.user }));
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-account-content account-edit">
      <div className="about-style-one-area default-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="about-style-one-info">
              <h4 className="sub-heading">Account Details</h4>
              <h2 className="title">Edit Account</h2>
              <form onSubmit={handleSubmit} className="max-w-md mx-auto" id="form-password-change">
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    id="name"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <label className="tf-field-label fw-4 text_black-2" htmlFor="name">
                    Name
                  </label>
                </div>
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="email"
                    autoComplete="email"
                    required
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <label className="tf-field-label fw-4 text_black-2" htmlFor="email">
                    Email
                  </label>
                </div>
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="tel"
                    required
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <label className="tf-field-label fw-4 text_black-2" htmlFor="phone">
                    Phone
                  </label>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <div className="mb_20">
                  <button
                    type="submit"
                    className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}