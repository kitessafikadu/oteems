import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ReportsService } from './reports.service';
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

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get dashboard summary',
    description:
      'Returns employee, department, and leave request statistics. Admin and HR users receive organization-wide statistics. Department managers receive statistics for their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics returned successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. The user does not have permission or the department manager is not assigned to a department.',
  })
  async getDashboard(@Req() req: any) {
    return this.reportsService.getDashboard(req.user);
  }

  @Get('employees')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get employee report',
    description:
      'Returns employee statistics grouped by employment status. Department managers only see statistics for their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee report returned successfully.',
  })
  async getEmployeeReport(@Req() req: any) {
    return this.reportsService.getEmployeeReport(req.user);
  }

  @Get('employees/by-department')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get employees grouped by department',
    description:
      'Returns the number of employees in each department. Department managers only receive their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee department statistics returned successfully.',
  })
  async getEmployeesByDepartment(@Req() req: any) {
    return this.reportsService.getEmployeesByDepartment(req.user);
  }

  @Get('leaves')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get leave request report',
    description:
      'Returns the total number of leave requests grouped by status. Department managers only see leave requests belonging to employees in their department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request report returned successfully.',
  })
  async getLeaveReport(@Req() req: any) {
    return this.reportsService.getLeaveReport(req.user);
  }

  @Get('leaves/by-type')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get leave requests grouped by type',
    description:
      'Returns leave request counts and total leave days for each leave type. Department managers only see their department data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave type statistics returned successfully.',
  })
  async getLeavesByType(@Req() req: any) {
    return this.reportsService.getLeavesByType(req.user);
  }

  @Get('leaves/by-department')
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  @ApiOperation({
    summary: 'Get leave requests grouped by department',
    description:
      'Returns leave request counts and total leave days for each department. Department managers only receive statistics for their own department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave department statistics returned successfully.',
  })
  async getLeavesByDepartment(@Req() req: any) {
    return this.reportsService.getLeavesByDepartment(req.user);
  }
}
