// components/SearchForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchForm() {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState("");

  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Construct the query string based on entered values
    const queryParams = new URLSearchParams();
    queryParams.append("page", "1");

    if (brand) queryParams.append("brand", brand);
    if (name) queryParams.append("name", name);
    if (startDate) queryParams.append("startDate", startDate);
    if (description) queryParams.append("description", description);
    if (limit) queryParams.append("limit", limit);

    router.push(`/search?${queryParams.toString()}`);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    const queryParams = new URLSearchParams();

    const value = e.target.value;
    setLimit(value);

    console.log("value: ", value);
    console.log("setLimit: ", limit);

    queryParams.append("page", "1");

    if (brand) queryParams.append("brand", brand);
    if (name) queryParams.append("name", name);
    if (startDate) queryParams.append("startDate", startDate);
    if (description) queryParams.append("description", description);
    if (value) queryParams.append("limit", value);

    router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="brand">Brand:</label>
        <input
          type="text"
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="startDate">Date:</label>
        <input
          type="text"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="limit">Limit:</label>
        <select
          id="limit"
          onChange={(e) => {
            handleOnChange(e);
          }}
          defaultValue={15}
        >
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="50">50</option>
        </select>
      </div>
      <div>
        <button type="submit">Search</button>
      </div>
    </form>
  );
}
