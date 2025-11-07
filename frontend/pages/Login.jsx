import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Signup from "./signup";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
        <input
          className="border w-full mb-3 p-2 rounded"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          className="border w-full mb-3 p-2 rounded"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        <p
          className="text-sm text-center mt-2 text-blue-600 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Don’t have an account? Signup
        </p>
      </form>
    </div>
  );
}
