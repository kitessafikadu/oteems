import type { Employee } from "./employee";

export type Department = {
  id: string;
  name: string;
  managerId?: string | null;
  manager?: {
    id: string;
    fullName: string;
  } | null;
  employees?: Employee[];
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
};
