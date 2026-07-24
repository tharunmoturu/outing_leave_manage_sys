import React from 'react';
import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';

interface TimelineProps {
  outing: any;
}

export const TimelineComponent: React.FC<TimelineProps> = ({ outing }) => {
  const steps = [];

  // Step 1: Applied
  steps.push({
    title: 'Applied',
    description: `Submitted on ${new Date(outing.createdAt).toLocaleString()}`,
    status: 'completed',
    icon: CheckCircle2,
    color: 'text-green-500'
  });

  // Step 2: Caretaker Decision
  if (outing.status === 'Pending') {
    steps.push({
      title: 'Pending Approval',
      description: 'Waiting for caretaker review',
      status: 'current',
      icon: Clock,
      color: 'text-yellow-500'
    });
  } else if (outing.status === 'Rejected') {
    steps.push({
      title: 'Rejected',
      description: `Rejected by ${outing.rejectedBy} on ${new Date(outing.rejectedAt).toLocaleString()}`,
      status: 'rejected',
      icon: XCircle,
      color: 'text-red-500'
    });
  } else {
    // Approved, Exited, Returned, Completed
    steps.push({
      title: 'Approved',
      description: `Approved by ${outing.approvedBy} on ${new Date(outing.approvedAt).toLocaleString()}`,
      status: 'completed',
      icon: CheckCircle2,
      color: 'text-green-500'
    });
  }

  // Step 3: Gate Pass & Completion (Only if not pending/rejected)
  if (['Approved', 'Exited', 'Returned', 'Completed'].includes(outing.status)) {
    if (outing.status === 'Approved') {
      steps.push({
        title: 'Gate Pass Active',
        description: 'Waiting to exit',
        status: 'current',
        icon: Circle,
        color: 'text-blue-500'
      });
      steps.push({
        title: 'Completed',
        description: 'Pending return',
        status: 'upcoming',
        icon: Circle,
        color: 'text-gray-300'
      });
    } else if (outing.status === 'Exited') {
      steps.push({
        title: 'Exited Hostel',
        description: 'Currently outside',
        status: 'completed',
        icon: CheckCircle2,
        color: 'text-green-500'
      });
      steps.push({
        title: 'Completed',
        description: 'Pending return',
        status: 'current',
        icon: Circle,
        color: 'text-blue-500'
      });
    } else {
      // Returned or dynamically Completed
      steps.push({
        title: 'Gate Pass Used',
        description: 'Outing period ended',
        status: 'completed',
        icon: CheckCircle2,
        color: 'text-green-500'
      });
      steps.push({
        title: 'Completed',
        description: 'Outing successfully completed',
        status: 'completed',
        icon: CheckCircle2,
        color: 'text-purple-500'
      });
    }
  }

  return (
    <div className="pl-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="relative pb-8 last:pb-0">
            {/* Line connecting steps */}
            {!isLast && (
              <div className="absolute top-6 left-3 -ml-px h-full w-0.5 bg-gray-200" />
            )}
            
            <div className="relative flex items-start space-x-4">
              <div className="relative">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                  <Icon className={`h-5 w-5 ${step.color}`} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-[13px] text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
