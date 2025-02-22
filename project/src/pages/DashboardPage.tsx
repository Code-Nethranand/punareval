import React from "react";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Welcome back, {user?.usn}</h1>
        <p className="text-gray-600">
          Manage your revaluation applications and track their status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Processing</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-600">3</p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Completed</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">0</p>
        </div>
      </div>
    </div>
  );
};
