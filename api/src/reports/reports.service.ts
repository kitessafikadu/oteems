import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EmploymentStatus,
  LeaveRequestStatus,
  LeaveType,
  Prisma,
  UserRole,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
  employeeId?: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the department ID for a department manager.
   */
  private async getManagerDepartmentId(
    user: AuthenticatedUser,
  ): Promise<string> {
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
      throw new NotFoundException('Employee profile not found');
    }

    if (!employee.managedDepartment) {
      throw new ForbiddenException(
        'Department manager is not assigned to a department',
      );
    }

    return employee.managedDepartment.id;
  }

  /**
   * Returns the department scope for the current user.
   *
   * ADMIN and HR_USER:
   *     All departments.
   *
   * DEPARTMENT_MANAGER:
   *     Own department only.
   */
  private async getDepartmentScope(
    user: AuthenticatedUser,
  ): Promise<string | undefined> {
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR_USER) {
      return undefined;
    }

    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      return this.getManagerDepartmentId(user);
    }

    throw new ForbiddenException(
      'You do not have permission to access reports',
    );
  }

  /**
   * Dashboard summary.
   */
  async getDashboard(user: AuthenticatedUser) {
    const departmentId = await this.getDepartmentScope(user);

    const employeeWhere: Prisma.EmployeeWhereInput = departmentId
      ? { departmentId }
      : {};

    const leaveWhere: Prisma.LeaveRequestWhereInput = departmentId
      ? {
          employee: {
            departmentId,
          },
        }
      : {};

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      totalLeaveRequests,
      draftLeaveRequests,
      submittedLeaveRequests,
      approvedLeaveRequests,
      rejectedLeaveRequests,
      cancelledLeaveRequests,
      totalDepartments,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: employeeWhere,
      }),

      this.prisma.employee.count({
        where: {
          ...employeeWhere,
          status: EmploymentStatus.ACTIVE,
        },
      }),

      this.prisma.employee.count({
        where: {
          ...employeeWhere,
          status: EmploymentStatus.INACTIVE,
        },
      }),

      this.prisma.employee.count({
        where: {
          ...employeeWhere,
          status: EmploymentStatus.TERMINATED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: leaveWhere,
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...leaveWhere,
          status: LeaveRequestStatus.DRAFT,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...leaveWhere,
          status: LeaveRequestStatus.SUBMITTED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...leaveWhere,
          status: LeaveRequestStatus.APPROVED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...leaveWhere,
          status: LeaveRequestStatus.REJECTED,
        },
      }),

      this.prisma.leaveRequest.count({
        where: {
          ...leaveWhere,
          status: LeaveRequestStatus.CANCELLED,
        },
      }),

      departmentId ? Promise.resolve(1) : this.prisma.department.count(),
    ]);

    return {
      scope: departmentId ? 'OWN_DEPARTMENT' : 'ALL_DEPARTMENTS',

      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        terminated: terminatedEmployees,
      },

      leaveRequests: {
        total: totalLeaveRequests,
        draft: draftLeaveRequests,
        submitted: submittedLeaveRequests,
        approved: approvedLeaveRequests,
        rejected: rejectedLeaveRequests,
        cancelled: cancelledLeaveRequests,
      },

      departments: {
        total: totalDepartments,
      },
    };
  }

  /**
   * Employee report.
   */
  async getEmployeeReport(user: AuthenticatedUser) {
    const departmentId = await this.getDepartmentScope(user);

    const where: Prisma.EmployeeWhereInput = departmentId
      ? { departmentId }
      : {};

    const [total, active, inactive, terminated] = await Promise.all([
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
    ]);

    return {
      scope: departmentId ? 'OWN_DEPARTMENT' : 'ALL_DEPARTMENTS',
      total,
      active,
      inactive,
      terminated,
    };
  }

  /**
   * Employee count grouped by department.
   */
  async getEmployeesByDepartment(user: AuthenticatedUser) {
    const departmentId = await this.getDepartmentScope(user);

    const where: Prisma.EmployeeWhereInput = departmentId
      ? { departmentId }
      : {};

    const grouped = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      where,
      _count: {
        id: true,
      },
    });

    const departmentIds = grouped.map((item) => item.departmentId);

    const departments = await this.prisma.department.findMany({
      where: {
        id: {
          in: departmentIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const departmentMap = new Map(
      departments.map((department) => [department.id, department.name]),
    );

    return grouped.map((item) => ({
      departmentId: item.departmentId,
      departmentName: departmentMap.get(item.departmentId) ?? 'Unknown',
      employeeCount: item._count.id,
    }));
  }

  /**
   * Leave request report.
   */
  async getLeaveReport(user: AuthenticatedUser) {
    const departmentId = await this.getDepartmentScope(user);

    const where: Prisma.LeaveRequestWhereInput = departmentId
      ? {
          employee: {
            departmentId,
          },
        }
      : {};

    const [total, draft, submitted, approved, rejected, cancelled] =
      await Promise.all([
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
      ]);

    return {
      scope: departmentId ? 'OWN_DEPARTMENT' : 'ALL_DEPARTMENTS',

      total,

      byStatus: {
        draft,
        submitted,
        approved,
        rejected,
        cancelled,
      },
    };
  }

  /**
   * Leave requests grouped by leave type.
   */
  async getLeavesByType(user: AuthenticatedUser) {
    const departmentId = await this.getDepartmentScope(user);

    const where: Prisma.LeaveRequestWhereInput = departmentId
      ? {
          employee: {
            departmentId,
          },
        }
      : {};

    const grouped = await this.prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        leaveDays: true,
      },
    });

    const result = Object.values(LeaveType).map((leaveType) => {
      const item = grouped.find((group) => group.leaveType === leaveType);

      return {
        leaveType,
        requestCount: item?._count.id ?? 0,
        totalLeaveDays: item?._sum.leaveDays ?? 0,
      };
    });

    return {
      scope: departmentId ? 'OWN_DEPARTMENT' : 'ALL_DEPARTMENTS',
      data: result,
    };
  }

  /**
   * Leave requests grouped by department.
   */
  async getLeavesByDepartment(user: AuthenticatedUser) {
    const departmentId = await this.getDepartmentScope(user);

    const where: Prisma.LeaveRequestWhereInput = departmentId
      ? {
          employee: {
            departmentId,
          },
        }
      : {};

    const grouped = await this.prisma.leaveRequest.groupBy({
      by: ['employeeId'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        leaveDays: true,
      },
    });

    const employeeIds = grouped.map((item) => item.employeeId);

    const employees = await this.prisma.employee.findMany({
      where: {
        id: {
          in: employeeIds,
        },
      },
      select: {
        id: true,
        departmentId: true,
      },
    });

    const employeeMap = new Map(
      employees.map((employee) => [employee.id, employee.departmentId]),
    );

    const departmentStats = new Map<
      string,
      {
        requestCount: number;
        totalLeaveDays: number;
      }
    >();

    for (const item of grouped) {
      const employeeDepartmentId = employeeMap.get(item.employeeId);

      if (!employeeDepartmentId) {
        continue;
      }

      const existing = departmentStats.get(employeeDepartmentId);

      if (existing) {
        existing.requestCount += item._count.id;
        existing.totalLeaveDays += item._sum.leaveDays ?? 0;
      } else {
        departmentStats.set(employeeDepartmentId, {
          requestCount: item._count.id,
          totalLeaveDays: item._sum.leaveDays ?? 0,
        });
      }
    }

    const departments = await this.prisma.department.findMany({
      where: {
        id: {
          in: Array.from(departmentStats.keys()),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const departmentMap = new Map(
      departments.map((department) => [department.id, department.name]),
    );

    return Array.from(departmentStats.entries()).map(
      ([departmentId, stats]) => ({
        departmentId,
        departmentName: departmentMap.get(departmentId) ?? 'Unknown',
        ...stats,
      }),
    );
  }
}
