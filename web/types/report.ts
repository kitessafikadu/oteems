export type ReportType = "EMPLOYEE" | "LEAVE" | "DEPARTMENT" | "ATTENDANCE";

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
