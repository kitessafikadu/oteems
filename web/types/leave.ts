export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "OTHER";

export type LeaveRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveRequestStatus;
  createdAt: string;
  updatedAt: string;

  employee?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
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
