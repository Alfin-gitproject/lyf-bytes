"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { countries } from "@/data/countries";

interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  city: string;
  country: string;
  province: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface EditAddressProps {
  activeAdd: boolean;
  setActiveAdd: (active: boolean) => void;
  address: Address;
  onSuccess: () => void;
}

export default function EditAddress({ activeAdd, setActiveAdd, address, onSuccess }: EditAddressProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    city: "",
    country: "",
    province: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        firstName: address.firstName || "",
        lastName: address.lastName || "",
        company: address.company || "",
        address: address.address || "",
        city: address.city || "",
        country: address.country || "",
        province: address.province || "",
        postalCode: address.postalCode || "",
        phone: address.phone || "",
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

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
      await axios.put(
        `/api/addresses/${address._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      toast.success("Address updated successfully");
      setActiveAdd(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to update address");
      console.error(error);
    }
  };

  return (
    <form
      className="edit-form-address wd-form-address"
      id="formeditAddress"
      onSubmit={handleSubmit}
      style={activeAdd ? { display: "block" } : { display: "none" }}
    >
      <div className="title">Edit address</div>
      <div className="box-field grid-2-lg">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="firstNameEdit"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="firstNameEdit">
            First name
          </label>
        </div>
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="lastNameEdit"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="lastNameEdit">
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
            id="companyEdit"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="companyEdit">
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
            id="addressEdit"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="addressEdit">
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
            id="cityEdit"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="cityEdit">
            City
          </label>
        </div>
      </div>
      <div className="box-field">
        <label htmlFor="countryEdit" className="mb_10 fw-4 text-start d-block text_black-2">
          Country/Region
        </label>
        <div className="select-custom">
          <select
            className="tf-select w-100"
            id="countryEdit"
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
            id="provinceEdit"
            name="province"
            value={formData.province}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="provinceEdit">
            Province
          </label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="postalCodeEdit"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="postalCodeEdit">
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
            id="phoneEdit"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="phoneEdit">
            Phone
          </label>
        </div>
      </div>
      <div className="box-field text-start">
        <div className="box-checkbox fieldset-radio d-flex align-items-center gap-8">
          <input
            type="checkbox"
            id="check-edit-address"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
          />
          <label htmlFor="check-edit-address" className="text_black-2 fw-4">
            Set as default address
          </label>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-center gap-20">
        <button type="submit" className="tf-btn btn-fill animate-hover-btn">
          Update address
        </button>
        <button
          type="button"
          className="tf-btn btn-fill animate-hover-btn btn-hide-edit-address"
          onClick={() => setActiveAdd(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}