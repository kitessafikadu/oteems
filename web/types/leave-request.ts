export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "OTHER";

export type LeaveRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  requestNumber?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  leaveDays?: number;
  reason?: string;
  status: LeaveRequestStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;

  employee?: {
    id: string;
    employeeId: string;
    fullName?: string;
    department?: {
      id: string;
      name: string;
    };
    user?: {
      role: string;
    };
  };

  reviewer?: {
    id: string;
    username: string;
  };
};

export type CreateLeaveRequestPayload = {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
};

export type UpdateLeaveRequestPayload = {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
};
