import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  EmploymentStatus,
  LeaveRequestStatus,
  LeaveType,
  Prisma,
  UserRole,
} from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { EmployeeReportDto } from './dto/employee-report.dto';
import { LeaveReportDto } from './dto/leave-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // EMPLOYEE REPORT
  // ============================================================

  async getEmployeeReport(user: any, dto: EmployeeReportDto) {
    const departmentId = await this.getEffectiveDepartmentId(
      user,
      dto.departmentId,
    );

    const where: Prisma.EmployeeWhereInput = {
      ...(departmentId
        ? {
            departmentId,
          }
        : {}),

      ...(dto.status
        ? {
            status: dto.status,
          }
        : {}),

      ...(dto.startDate || dto.endDate
        ? {
            hireDate: {
              ...(dto.startDate
                ? {
                    gte: new Date(dto.startDate),
                  }
                : {}),

              ...(dto.endDate
                ? {
                    lte: this.endOfDay(dto.endDate),
                  }
                : {}),
            },
          }
        : {}),
    };

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      employees,
    ] = await Promise.all([
      this.prisma.employee.count({
        where,
      }),

      this.prisma.employee.count({
        where: {
          ...where,
          status: EmploymentStatus.ACTIVE,
        },
      }),

      this.prisma.employee.count({
        where: {
          ...where,
          status: EmploymentStatus.INACTIVE,
        },
      }),

      this.prisma.employee.count({
        where: {
          ...where,
          status: EmploymentStatus.TERMINATED,
        },
      }),

      this.prisma.employee.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          phone: true,
          email: true,
          position: true,
          hireDate: true,
          status: true,

          department: {
            select: {
              id: true,
              name: true,
            },
          },

          user: {
            select: {
              id: true,
              username: true,
              role: true,
              isActive: true,
            },
          },
        },

        orderBy: {
          fullName: 'asc',
        },
      }),
    ]);

    return {
      summary: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        terminatedEmployees,
      },

      employees,
    };
  }

  // ============================================================
  // LEAVE REPORT
  // ============================================================

  async getLeaveReport(user: any, dto: LeaveReportDto) {
    const departmentId = await this.getEffectiveDepartmentId(
      user,
      dto.departmentId,
    );

    const where = this.buildLeaveWhere(departmentId, dto);

    const [
      totalRequests,
      draftRequests,
      submittedRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
      totalLeaveDays,
      requests,
    ] = await Promise.all([
      this.prisma.leaveRequest.count({
        where,
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...where,
          status: LeaveRequestStatus.DRAFT,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...where,
          status: LeaveRequestStatus.SUBMITTED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...where,
          status: LeaveRequestStatus.APPROVED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...where,
          status: LeaveRequestStatus.REJECTED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...where,
          status: LeaveRequestStatus.CANCELLED,
        },
      }),

      this.getTotalLeaveDays(where),

      this.prisma.leaveRequest.findMany({
        where,

        select: {
          id: true,
          requestNumber: true,
          leaveType: true,
          startDate: true,
          endDate: true,
          leaveDays: true,
          reason: true,
          status: true,
          reviewedAt: true,
          rejectionReason: true,
          createdAt: true,

          employee: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              email: true,

              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          reviewer: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      summary: {
        totalRequests,
        draftRequests,
        submittedRequests,
        approvedRequests,
        rejectedRequests,
        cancelledRequests,
        totalLeaveDays,
      },

      requests,
    };
  }

  // ============================================================
  // LEAVE REPORT BY TYPE
  // ============================================================

  async getLeavesByType(user: any, dto: LeaveReportDto) {
    const departmentId = await this.getEffectiveDepartmentId(
      user,
      dto.departmentId,
    );

    const where = this.buildLeaveWhere(departmentId, dto);

    const results = await this.prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      where,

      _count: {
        id: true,
      },

      _sum: {
        leaveDays: true,
      },

      orderBy: {
        leaveType: 'asc',
      },
    });

    return results.map((item) => ({
      leaveType: item.leaveType,
      requestCount: item._count.id,
      totalLeaveDays: item._sum.leaveDays ?? 0,
    }));
  }

  // ============================================================
  // LEAVE REPORT BY DEPARTMENT
  // ============================================================

  async getLeavesByDepartment(user: any, dto: LeaveReportDto) {
    const departmentId = await this.getEffectiveDepartmentId(
      user,
      dto.departmentId,
    );

    const where = this.buildLeaveWhere(departmentId, dto);

    const requests = await this.prisma.leaveRequest.findMany({
      where,

      select: {
        leaveDays: true,

        employee: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const departmentMap = new Map<
      string,
      {
        departmentId: string;
        departmentName: string;
        requestCount: number;
        totalLeaveDays: number;
      }
    >();

    for (const request of requests) {
      const department = request.employee.department;

      const existing = departmentMap.get(department.id);

      if (existing) {
        existing.requestCount += 1;
        existing.totalLeaveDays += request.leaveDays;
      } else {
        departmentMap.set(department.id, {
          departmentId: department.id,
          departmentName: department.name,
          requestCount: 1,
          totalLeaveDays: request.leaveDays,
        });
      }
    }

    return Array.from(departmentMap.values()).sort((a, b) =>
      a.departmentName.localeCompare(b.departmentName),
    );
  }

  // ============================================================
  // BUILD LEAVE WHERE
  // ============================================================

  private buildLeaveWhere(
    departmentId: string | undefined,
    dto: LeaveReportDto,
  ): Prisma.LeaveRequestWhereInput {
    return {
      ...(departmentId
        ? {
            employee: {
              departmentId,
            },
          }
        : {}),

      ...(dto.leaveType
        ? {
            leaveType: dto.leaveType,
          }
        : {}),

      ...(dto.status
        ? {
            status: dto.status,
          }
        : {}),

      ...(dto.startDate || dto.endDate
        ? {
            startDate: {
              ...(dto.startDate
                ? {
                    gte: new Date(dto.startDate),
                  }
                : {}),

              ...(dto.endDate
                ? {
                    lte: this.endOfDay(dto.endDate),
                  }
                : {}),
            },
          }
        : {}),
    };
  }

  // ============================================================
  // TOTAL LEAVE DAYS
  // ============================================================

  private async getTotalLeaveDays(
    where: Prisma.LeaveRequestWhereInput,
  ): Promise<number> {
    const result = await this.prisma.leaveRequest.aggregate({
      where,

      _sum: {
        leaveDays: true,
      },
    });

    return result._sum.leaveDays ?? 0;
  }

  // ============================================================
  // DEPARTMENT SCOPE
  // ============================================================

  private async getEffectiveDepartmentId(
    user: any,
    requestedDepartmentId?: string,
  ): Promise<string | undefined> {
    // Admin and HR can access all departments,
    // unless they explicitly filter by department.
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR_USER) {
      return requestedDepartmentId;
    }

    // Department manager must always be restricted
    // to their own department.
    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      if (!user.employeeId) {
        throw new ForbiddenException(
          'Department manager is not assigned to an employee',
        );
      }

      const employee = await this.prisma.employee.findUnique({
        where: {
          id: user.employeeId,
        },

        select: {
          departmentId: true,
          managedDepartment: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!employee) {
        throw new ForbiddenException('Employee profile not found');
      }

      if (!employee.managedDepartment) {
        throw new ForbiddenException(
          'Department manager is not assigned to a department',
        );
      }

      // Do not allow the manager to select
      // another department.
      if (
        requestedDepartmentId &&
        requestedDepartmentId !== employee.departmentId
      ) {
        throw new ForbiddenException(
          'You can only access reports for your own department',
        );
      }

      return employee.departmentId;
    }

    return undefined;
  }

  // ============================================================
  // DATE HELPER
  // ============================================================

  private endOfDay(date: string): Date {
    const result = new Date(date);

    result.setHours(23, 59, 59, 999);

    return result;
  }
}
