import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineEvent {
  status: string;
  timestamp: Date;
  description: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            {
              'bg-green-100': event.status === 'completed',
              'bg-yellow-100': event.status === 'processing',
              'bg-blue-100': event.status === 'pending',
            }
          )}>
            {event.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {event.status === 'processing' && <Clock className="h-5 w-5 text-yellow-600" />}
            {event.status === 'pending' && <AlertCircle className="h-5 w-5 text-blue-600" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium capitalize">{event.status}</p>
              <time className="text-sm text-gray-500">
                {format(event.timestamp, 'PPp')}
              </time>
            </div>
            <p className="mt-1 text-sm text-gray-600">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};