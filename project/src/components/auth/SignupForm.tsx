import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { api } from "../../lib/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    usn: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    branch: "",
    semester: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("Signup attempt with:", formData);
      const { data } = await api.post("/users/register", formData);
      console.log("Signup response:", data);

      // Login with the returned user data
      login({
        usn: data.user.usn,
        name: data.user.name,
        email: data.user.email,
        branch: data.user.branch,
        semester: data.user.semester,
        createdAt: data.user.createdAt,
      });

      // Store token
      localStorage.setItem('token', data.token);

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error occurred:", error);
      setError(error.response?.data?.message || "Signup failed");
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2 text-center">
        <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-gray-500">Sign up to get started with VTU Revaluation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="USN"
          type="text"
          value={formData.usn}
          onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
          placeholder="Enter your USN"
          required
        />
        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your full name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
        />
        <Input
          label="Branch"
          type="text"
          value={formData.branch}
          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          placeholder="Enter your branch (e.g., CSE, ECE)"
          required
        />
        <Input
          label="Semester"
          type="number"
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
          placeholder="Enter your current semester"
          min="1"
          max="8"
          required
        />
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Create a password"
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Confirm your password"
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};
