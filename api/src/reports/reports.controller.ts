import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import { EmployeeReportDto } from './dto/employee-report.dto';
import { LeaveReportDto } from './dto/leave-report.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '../../generated/prisma/client';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ============================================================
  // EMPLOYEE REPORT
  // ============================================================

  @Get('employees')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get employee report',
    description:
      'Returns employee statistics and employee records. Admin and HR users can view all employees. Department managers can only view employees in their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee report generated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Department manager is not assigned to a department.',
  })
  async getEmployeeReport(@Req() req: any, @Query() dto: EmployeeReportDto) {
    return this.reportsService.getEmployeeReport(req.user, dto);
  }

  // ============================================================
  // LEAVE REPORT
  // ============================================================

  @Get('leaves')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get leave request report',
    description:
      'Returns leave request statistics and leave request records. Department managers can only view requests from employees in their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave report generated successfully.',
  })
  async getLeaveReport(@Req() req: any, @Query() dto: LeaveReportDto) {
    return this.reportsService.getLeaveReport(req.user, dto);
  }

  // ============================================================
  // LEAVE REPORT BY TYPE
  // ============================================================

  @Get('leaves/by-type')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get leave report grouped by leave type',
    description: 'Returns the number of leave requests grouped by leave type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave type report generated successfully.',
  })
  async getLeavesByType(@Req() req: any, @Query() dto: LeaveReportDto) {
    return this.reportsService.getLeavesByType(req.user, dto);
  }

  // ============================================================
  // LEAVE REPORT BY DEPARTMENT
  // ============================================================

  @Get('leaves/by-department')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get leave report grouped by department',
    description:
      'Returns leave request statistics grouped by department. Department managers only receive data for their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Department leave report generated successfully.',
  })
  async getLeavesByDepartment(@Req() req: any, @Query() dto: LeaveReportDto) {
    return this.reportsService.getLeavesByDepartment(req.user, dto);
  }

  // ============================================================
  // SUMMARY REPORT (HR / Admin / Dept Manager scoped)
  // ============================================================

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get summary report',
    description:
      'Returns organisation-wide summary for HR/Admin, and department‑scoped summary for Department Managers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary report generated successfully.',
  })
  async getSummary(@Req() req: any) {
    return this.reportsService.getSummary(req.user);
  }

  // ============================================================
  // MY SUMMARY REPORT (any authenticated user linked to employee)
  // ============================================================

  @Get('my-summary')
  @ApiOperation({
    summary: 'Get my leave summary',
    description:
      'Returns the authenticated employee’s own leave statistics and recent requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Personal leave summary generated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not linked to an employee.',
  })
  async getMySummary(@Req() req: any) {
    return this.reportsService.getMySummary(req.user);
  }
}
