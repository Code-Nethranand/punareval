import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!usn || !password) {
        toast.error("Please enter both USN and password");
        setLoading(false);
        return;
      }

      const { data } = await api.post("/users/login", {
        usn: usn.toUpperCase(),
        password,
      });

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // Update auth state with both user and token
      login(data.user, data.token);

      // Get and clear redirect URL
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");

      // Check for pending payment verification
      const pendingPayment = localStorage.getItem('pendingPaymentVerification');
      
      // Show success message
      toast.success("Login successful!");

      // Handle redirect
      if (pendingPayment) {
        localStorage.removeItem('pendingPaymentVerification');
        navigate('/dashboard/payment');
      } else if (redirectUrl && !redirectUrl.includes('/login')) {
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-gray-500">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="usn"
            className="block text-sm font-medium text-gray-700"
          >
            USN
          </label>
          <input
            id="usn"
            type="text"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter your USN"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
};
