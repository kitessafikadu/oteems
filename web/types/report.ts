export type ReportType = "EMPLOYEE" | "LEAVE" | "DEPARTMENT";

export type Report = {
  id: string;
  title: string;
  type: ReportType;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReportPayload = {
  title: string;
  type: ReportType;
  description?: string;
};

export type UpdateReportPayload = {
  title?: string;
  type?: ReportType;
  description?: string;
};

export interface SummaryReport {
  employees: {
    total: number;
    active: number;
    inactive: number;
  };
  departments: {
    total: number;
  };
  leave: {
    pending: number;
    approved: number;
    onLeaveToday: number;
  };
}

export interface EmployeeReport {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    terminatedEmployees: number;
  };
  employees: Array<{
    id: string;
    employeeId: string;
    fullName: string;
    email: string;
    phone?: string;
    position?: string;
    hireDate: string;
    status: string;
    department?: {
      id: string;
      name: string;
    };
    user?: {
      id: string;
      username: string;
      role: string;
      isActive: boolean;
    } | null;
  }>;
}

export interface LeaveReport {
  summary: {
    totalRequests: number;
    draftRequests: number;
    submittedRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    cancelledRequests: number;
    totalLeaveDays: number;
  };
  requests: Array<{
    id: string;
    requestNumber: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    leaveDays: number;
    reason?: string;
    status: string;
    reviewedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    employee: {
      id: string;
      employeeId: string;
      fullName: string;
      email: string;
      department?: {
        id: string;
        name: string;
      };
    };
    reviewer?: {
      id: string;
      username: string;
      role: string;
    } | null;
  }>;
}

export type LeaveByTypeReport = Array<{
  leaveType: string;
  requestCount: number;
  totalLeaveDays: number;
}>;

export type LeaveByDepartmentReport = Array<{
  departmentId: string;
  departmentName: string;
  requestCount: number;
  totalLeaveDays: number;
}>;

export interface MySummaryReport {
  leave: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
  recentRequests: Array<{
    requestNumber: string;
    leaveType: string;
    status: string;
  }>;
}
