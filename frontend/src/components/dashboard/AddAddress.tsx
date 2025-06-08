"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { countries } from "@/data/countries";

interface AddAddressProps {
  activeEdit: boolean;
  setActiveEdit: (active: boolean) => void;
  onSuccess: () => void;
}

export default function AddAddress({ activeEdit, setActiveEdit, onSuccess }: AddAddressProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.post(
        "/api/addresses",
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      toast.success("Address added successfully");
      setActiveEdit(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add address");
      console.error(error);
    }
  };

  return (
    <form
      className="show-form-address wd-form-address"
      id="formnewAddress"
      onSubmit={handleSubmit}
      style={activeEdit ? { display: "block" } : { display: "none" }}
    >
      <div className="title">Add a new address</div>
      <div className="box-field grid-2-lg">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="firstName">
            First name
          </label>
        </div>
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="lastName">
            Last name
          </label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="company">
            Company
          </label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="address">
            Address
          </label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="city">
            City
          </label>
        </div>
      </div>
      <div className="box-field">
        <label htmlFor="country" className="mb_10 fw-4 text-start d-block text_black-2">
          Country/Region
        </label>
        <div className="select-custom">
          <select
            className="tf-select w-100"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          >
            <option value="">---</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="postalCode">
            Postal/ZIP code
          </label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="phone">
            Phone
          </label>
        </div>
      </div>
      <div className="box-field text-start">
        <div className="box-checkbox fieldset-radio d-flex align-items-center gap-8">
          <input
            type="checkbox"
            id="check-new-address"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
          />
          <label htmlFor="check-new-address" className="text_black-2 fw-4">
            Set as default address
          </label>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-center gap-20">
        <button type="submit" className="tf-btn btn-fill animate-hover-btn">
          Add address
        </button>
        <button
          type="button"
          className="tf-btn btn-fill animate-hover-btn btn-hide-address"
          onClick={() => setActiveEdit(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}