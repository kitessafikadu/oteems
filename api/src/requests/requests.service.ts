import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EmploymentStatus,
  LeaveRequestAction,
  LeaveRequestStatus,
  LeaveType,
  Prisma,
  UserRole,
} from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { RejectLeaveRequestDto } from './dto/reject-leave-request.dto';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(
    userId: string,
    createLeaveRequestDto: CreateLeaveRequestDto,
  ) {
    const user = await this.getUserWithEmployee(userId);

    if (!user.employee) {
      throw new BadRequestException(
        'Your account is not linked to an employee',
      );
    }

    if (
      user.role !== UserRole.EMPLOYEE &&
      user.role !== UserRole.DEPARTMENT_MANAGER
    ) {
      throw new ForbiddenException('Only employees can create leave requests');
    }

    if (user.employee.status !== EmploymentStatus.ACTIVE) {
      throw new ForbiddenException(
        'Only active employees can create leave requests',
      );
    }

    const startDate = this.normalizeDate(createLeaveRequestDto.startDate);
    const endDate = this.normalizeDate(createLeaveRequestDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    const today = this.startOfToday();
    if (startDate < today) {
      throw new BadRequestException('Leave start date cannot be in the past');
    }

    const leaveDays = this.calculateLeaveDays(startDate, endDate);

    await this.checkForOverlappingRequests(
      user.employee.id,
      startDate,
      endDate,
    );

    await this.validateLeaveBalance(
      user.employee.id,
      createLeaveRequestDto.leaveType,
      startDate,
      leaveDays,
    );

    const requestNumber = await this.generateRequestNumber();

    const request = await this.prisma.$transaction(async (tx) => {
      const createdRequest = await tx.leaveRequest.create({
        data: {
          requestNumber,
          employeeId: user.employee!.id,
          leaveType: createLeaveRequestDto.leaveType,
          startDate,
          endDate,
          leaveDays,
          reason: createLeaveRequestDto.reason,
          status: LeaveRequestStatus.SUBMITTED,
        },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: createdRequest.id,
          action: LeaveRequestAction.CREATED,
          performedById: user.id,
          comment: 'Leave request created',
        },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: createdRequest.id,
          action: LeaveRequestAction.SUBMITTED,
          performedById: user.id,
          comment: 'Leave request submitted for review',
        },
      });

      return createdRequest;
    });

    return this.getRequestById(userId, request.id);
  }

  async getMyRequests(userId: string) {
    const user = await this.getUserWithEmployee(userId);
    if (!user.employee) {
      throw new BadRequestException(
        'Your account is not linked to an employee',
      );
    }

    return this.prisma.leaveRequest.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: { employeeId: true, fullName: true, position: true },
        },
        reviewer: {
          select: { id: true, username: true, role: true },
        },
      },
    });
  }

  async getAllRequests(userId: string) {
    const user = await this.getUserWithEmployee(userId);
    this.ensureRole(user.role, [UserRole.ADMIN, UserRole.HR_USER]);

    return this.prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            position: true,
            department: { select: { id: true, name: true } },
          },
        },
        reviewer: { select: { id: true, username: true, role: true } },
      },
    });
  }

  async getDepartmentRequests(userId: string) {
    const user = await this.getUserWithEmployee(userId);
    if (user.role !== UserRole.DEPARTMENT_MANAGER) {
      throw new ForbiddenException(
        'Only department managers can view department requests',
      );
    }
    if (!user.employee) {
      throw new ForbiddenException('Manager is not linked to an employee');
    }

    const department = await this.prisma.department.findUnique({
      where: { managerId: user.employee.id },
      select: { id: true, name: true },
    });
    if (!department) {
      throw new ForbiddenException('You are not assigned to a department');
    }

    return this.prisma.leaveRequest.findMany({
      where: { employee: { departmentId: department.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            position: true,
          },
        },
        reviewer: { select: { id: true, username: true, role: true } },
      },
    });
  }

  async getRequestById(userId: string, requestId: string) {
    const user = await this.getUserWithEmployee(userId);
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            phone: true,
            email: true,
            position: true,
            departmentId: true,
            department: { select: { id: true, name: true } },
          },
        },
        reviewer: { select: { id: true, username: true, role: true } },
        history: {
          orderBy: { createdAt: 'asc' },
          include: {
            performedBy: { select: { id: true, username: true, role: true } },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    await this.ensureCanViewRequest(
      user,
      request.employeeId,
      request.employee.departmentId,
    );
    return request;
  }

  async updateRequest(
    userId: string,
    requestId: string,
    dto: CreateLeaveRequestDto,
  ) {
    const user = await this.getUserWithEmployee(userId);
    if (!user.employee) {
      throw new BadRequestException(
        'Your account is not linked to an employee',
      );
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.employeeId !== user.employee.id) {
      throw new ForbiddenException('You can only edit your own leave requests');
    }
    if (
      request.status !== LeaveRequestStatus.DRAFT &&
      request.status !== LeaveRequestStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Only draft or rejected requests can be edited',
      );
    }

    const startDate = this.normalizeDate(dto.startDate);
    const endDate = this.normalizeDate(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }
    if (startDate < this.startOfToday()) {
      throw new BadRequestException('Leave start date cannot be in the past');
    }

    const leaveDays = this.calculateLeaveDays(startDate, endDate);

    await this.checkForOverlappingRequests(
      request.employeeId,
      startDate,
      endDate,
      request.id,
    );

    await this.validateLeaveBalance(
      request.employeeId,
      dto.leaveType,
      startDate,
      leaveDays,
      request.id,
    );

    return this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        leaveType: dto.leaveType,
        startDate,
        endDate,
        leaveDays,
        reason: dto.reason,
      },
      include: {
        employee: { select: { employeeId: true, fullName: true } },
      },
    });
  }

  async resubmitRequest(userId: string, requestId: string) {
    const user = await this.getUserWithEmployee(userId);
    if (!user.employee) {
      throw new BadRequestException(
        'Your account is not linked to an employee',
      );
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.employeeId !== user.employee.id) {
      throw new ForbiddenException(
        'You can only resubmit your own leave requests',
      );
    }
    if (request.status !== LeaveRequestStatus.REJECTED) {
      throw new BadRequestException(
        'Only rejected requests can be resubmitted',
      );
    }
    if (request.startDate < this.startOfToday()) {
      throw new BadRequestException(
        'The leave start date has already passed. Please create a new request.',
      );
    }

    await this.checkForOverlappingRequests(
      request.employeeId,
      request.startDate,
      request.endDate,
      request.id,
    );

    await this.validateLeaveBalance(
      request.employeeId,
      request.leaveType,
      request.startDate,
      request.leaveDays,
      request.id,
    );

    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: LeaveRequestStatus.SUBMITTED,
          reviewedAt: null,
          reviewedById: null,
          rejectionReason: null,
        },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: requestId,
          action: LeaveRequestAction.RESUBMITTED,
          performedById: user.id,
          comment: 'Employee resubmitted the rejected leave request',
        },
      });

      return updated;
    });

    return this.getRequestById(userId, updatedRequest.id);
  }

  async submitRequest(userId: string, requestId: string) {
    const user = await this.getUserWithEmployee(userId);
    if (!user.employee) {
      throw new BadRequestException(
        'Your account is not linked to an employee',
      );
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.employeeId !== user.employee.id) {
      throw new ForbiddenException(
        'You can only submit your own leave requests',
      );
    }
    if (request.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be submitted');
    }

    await this.validateLeaveBalance(
      request.employeeId,
      request.leaveType,
      request.startDate,
      request.leaveDays,
      request.id,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.leaveRequest.update({
        where: { id: requestId },
        data: { status: LeaveRequestStatus.SUBMITTED },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: requestId,
          action: LeaveRequestAction.SUBMITTED,
          performedById: user.id,
          comment: 'Leave request submitted for review',
        },
      });

      return result;
    });

    return this.getRequestById(userId, updated.id);
  }

  async cancelRequest(userId: string, requestId: string) {
    const user = await this.getUserWithEmployee(userId);
    if (!user.employee) {
      throw new BadRequestException(
        'Your account is not linked to an employee',
      );
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.employeeId !== user.employee.id) {
      throw new ForbiddenException(
        'You can only cancel your own leave requests',
      );
    }
    if (
      request.status !== LeaveRequestStatus.DRAFT &&
      request.status !== LeaveRequestStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        'Only draft or submitted requests can be cancelled',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.leaveRequest.update({
        where: { id: requestId },
        data: { status: LeaveRequestStatus.CANCELLED },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: requestId,
          action: LeaveRequestAction.CANCELLED,
          performedById: user.id,
          comment: 'Leave request cancelled by employee',
        },
      });

      return result;
    });

    return this.getRequestById(userId, updated.id);
  }

  async approveRequest(userId: string, requestId: string) {
    const user = await this.getUserWithEmployee(userId);

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          select: {
            id: true,
            departmentId: true,
            user: {
              select: { id: true, role: true },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.status !== LeaveRequestStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted requests can be approved');
    }

    await this.ensureCanReviewRequest(
      user,
      request.employee,
      request.employee.departmentId,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: LeaveRequestStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedById: user.id,
          rejectionReason: null,
        },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: requestId,
          action: LeaveRequestAction.APPROVED,
          performedById: user.id,
          comment: 'Leave request approved',
        },
      });

      return result;
    });

    return this.getRequestById(userId, updated.id);
  }

  async rejectRequest(
    userId: string,
    requestId: string,
    dto: RejectLeaveRequestDto,
  ) {
    const user = await this.getUserWithEmployee(userId);

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          select: {
            id: true,
            departmentId: true,
            user: {
              select: { id: true, role: true },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.status !== LeaveRequestStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted requests can be rejected');
    }

    await this.ensureCanReviewRequest(
      user,
      request.employee,
      request.employee.departmentId,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: LeaveRequestStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedById: user.id,
          rejectionReason: dto.rejectionReason,
        },
      });

      await tx.leaveRequestHistory.create({
        data: {
          leaveRequestId: requestId,
          action: LeaveRequestAction.REJECTED,
          performedById: user.id,
          comment: dto.rejectionReason,
        },
      });

      return result;
    });

    return this.getRequestById(userId, updated.id);
  }

  async getRequestHistory(userId: string, requestId: string) {
    const user = await this.getUserWithEmployee(userId);
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        employeeId: true,
        employee: { select: { departmentId: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    await this.ensureCanViewRequest(
      user,
      request.employeeId,
      request.employee.departmentId,
    );

    return this.prisma.leaveRequestHistory.findMany({
      where: { leaveRequestId: requestId },
      orderBy: { createdAt: 'asc' },
      include: {
        performedBy: { select: { id: true, username: true, role: true } },
      },
    });
  }

  private async getUserWithEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            departmentId: true,
            status: true,
            hireDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Your account is inactive');
    }
    return user;
  }

  private async ensureCanViewRequest(
    user: {
      id: string;
      role: UserRole;
      employee: { id: string; departmentId: string } | null;
    },
    requestEmployeeId: string,
    requestDepartmentId: string,
  ) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR_USER) return;
    if (user.employee && user.employee.id === requestEmployeeId) return;
    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      await this.ensureManagerOfDepartment(
        user.employee?.id,
        requestDepartmentId,
      );
      return;
    }
    throw new ForbiddenException(
      'You are not allowed to view this leave request',
    );
  }

  private async ensureCanReviewRequest(
    approver: {
      id: string;
      role: UserRole;
      employee: { id: string; departmentId: string } | null;
    },
    requestEmployee: {
      id: string;
      departmentId: string;
      user: { id: string; role: UserRole } | null;
    },
    requestDepartmentId: string,
  ) {
    if (requestEmployee.user && approver.id === requestEmployee.user.id) {
      throw new ForbiddenException(
        'You cannot approve or reject your own leave request',
      );
    }

    const requesterRole = requestEmployee.user?.role;
    if (!requesterRole) {
      throw new ForbiddenException('Requester user account not found');
    }

    switch (requesterRole) {
      case UserRole.EMPLOYEE:
        if (
          approver.role === UserRole.ADMIN ||
          approver.role === UserRole.HR_USER
        )
          return;
        if (approver.role === UserRole.DEPARTMENT_MANAGER) {
          await this.ensureManagerOfDepartment(
            approver.employee?.id,
            requestDepartmentId,
          );
          return;
        }
        throw new ForbiddenException(
          'You are not authorized to review this request',
        );

      case UserRole.DEPARTMENT_MANAGER:
        if (
          approver.role === UserRole.ADMIN ||
          approver.role === UserRole.HR_USER
        )
          return;
        throw new ForbiddenException(
          'Only HR or Admin can review manager requests',
        );

      case UserRole.HR_USER:
        if (approver.role === UserRole.ADMIN) return;
        throw new ForbiddenException('Only Admin can review HR requests');

      case UserRole.ADMIN:
        if (approver.role === UserRole.ADMIN) return;
        throw new ForbiddenException(
          'Only another Admin can review Admin requests',
        );

      default:
        throw new ForbiddenException('Invalid requester role');
    }
  }

  private async ensureManagerOfDepartment(
    employeeId: string | undefined,
    departmentId: string,
  ) {
    if (!employeeId) {
      throw new ForbiddenException('Manager is not linked to an employee');
    }
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { managerId: true },
    });
    if (!department || department.managerId !== employeeId) {
      throw new ForbiddenException(
        'You are not the manager of this department',
      );
    }
  }

  private ensureRole(role: UserRole, allowedRoles: UserRole[]) {
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
  }

  private async checkForOverlappingRequests(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string,
  ) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: {
          in: [
            LeaveRequestStatus.DRAFT,
            LeaveRequestStatus.SUBMITTED,
            LeaveRequestStatus.APPROVED,
          ],
        },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(excludeRequestId ? { id: { not: excludeRequestId } } : {}),
      },
    });
    if (request) {
      throw new ConflictException(
        `You already have a leave request (${request.requestNumber}) covering part or all of these dates`,
      );
    }
  }

  private async validateLeaveBalance(
    employeeId: string,
    leaveType: LeaveType,
    startDate: Date,
    requestedDays: number,
    excludeRequestId?: string,
  ) {
    const year = startDate.getFullYear();

    const policy = await this.prisma.leavePolicy.findUnique({
      where: { leaveType },
    });

    if (!policy || policy.baseDays === 0) {
      return;
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { hireDate: true },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const totalEntitlement = this.calculateEntitlement(
      employee.hireDate,
      policy,
      year,
    );

    const usedDaysAgg = await this.prisma.leaveRequest.aggregate({
      where: {
        employeeId,
        leaveType,
        status: LeaveRequestStatus.APPROVED,
        startDate: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lte: new Date(`${year}-12-31T23:59:59Z`),
        },
        ...(excludeRequestId ? { id: { not: excludeRequestId } } : {}),
      },
      _sum: { leaveDays: true },
    });

    const usedDays = usedDaysAgg._sum.leaveDays || 0;
    const remainingDays = totalEntitlement - usedDays;

    if (requestedDays > remainingDays) {
      throw new BadRequestException(
        `Insufficient leave balance. You have ${remainingDays} day(s) remaining, but requested ${requestedDays} day(s).`,
      );
    }
  }

  private calculateEntitlement(
    hireDate: Date,
    policy: any,
    year: number,
  ): number {
    const yearsOfService = year - hireDate.getFullYear();
    let extraDays = 0;

    if (policy.seniorityBonus) {
      try {
        const bonuses = JSON.parse(policy.seniorityBonus);
        if (Array.isArray(bonuses)) {
          for (const bonus of bonuses) {
            if (yearsOfService >= bonus.years) {
              extraDays = Math.max(extraDays, bonus.extraDays);
            }
          }
        }
      } catch {}
    }

    return policy.baseDays + extraDays;
  }

  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const difference = endDate.getTime() - startDate.getTime();
    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }

  private normalizeDate(dateString: string): Date {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date provided');
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private async generateRequestNumber(): Promise<string> {
    const latest = await this.prisma.leaveRequest.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { requestNumber: true },
    });

    if (!latest) return 'LR-1001';

    const match = latest.requestNumber.match(/^LR-(\d+)$/);
    if (!match) return `LR-${Date.now()}`;

    const nextNumber = Number(match[1]) + 1;
    return `LR-${nextNumber}`;
  }
}
