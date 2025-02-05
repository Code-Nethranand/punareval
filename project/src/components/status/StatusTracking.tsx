import React, { useEffect, useState } from 'react';
import { useRevaluationStore } from '../../store/useRevaluationStore';
import { formatPrice, cn } from '../../lib/utils';
import { StatusTimeline } from './StatusTimeline';
import { fetchRevaluationStatus } from '../../lib/api';
import { toast } from 'react-hot-toast';

export const StatusTracking: React.FC = () => {
  const { requests } = useRevaluationStore();
  const [statusUpdates, setStatusUpdates] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchStatuses = async () => {
      for (const request of requests) {
        try {
          const status = await fetchRevaluationStatus(request.id);
          setStatusUpdates(prev => ({
            ...prev,
            [request.id]: status
          }));
        } catch (error) {
          toast.error(`Failed to fetch status for request ${request.id}`);
        }
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [requests]);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Application Status</h2>
        <p className="text-gray-600">Track your revaluation applications</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No revaluation requests found
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border bg-white p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Request #{request.id.slice(0, 8)}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>

              <StatusTimeline 
                events={[
                  {
                    status: 'pending',
                    timestamp: request.createdAt,
                    description: 'Application submitted successfully'
                  },
                  ...(statusUpdates[request.id]?.events || [])
                ]}
              />

              <div className="space-y-2">
                <h4 className="font-medium">Selected Subjects</h4>
                {request.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex justify-between text-sm"
                  >
                    <span>{subject.code} - {subject.name}</span>
                    <span>{formatPrice(subject.fee)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Payment Status:</span>
                    <span className={cn(
                      "ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      {
                        "bg-green-100 text-green-800": request.paymentStatus === 'completed',
                        "bg-yellow-100 text-yellow-800": request.paymentStatus === 'pending',
                        "bg-red-100 text-red-800": request.paymentStatus === 'failed'
                      }
                    )}>
                      {request.paymentStatus}
                    </span>
                  </div>
                  <span className="font-medium">
                    Total: {formatPrice(request.totalFee)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};