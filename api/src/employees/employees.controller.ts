import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';

import { UserRole } from '../../generated/prisma/client';

import { EmployeesService } from './employees.service';

import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthenticatedUser } from './employee-access.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // ============================================================
  // GET ALL EMPLOYEES
  //
  // ADMIN       -> All employees
  // HR_USER     -> All employees
  // MANAGER     -> Own department
  // ============================================================

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_USER, UserRole.DEPARTMENT_MANAGER)
  findAll(@Req() req: AuthenticatedRequest) {
    return this.employeesService.findAll(req.user);
  }

  // ============================================================
  // GET EMPLOYEE BY ID
  //
  // ADMIN       -> Any employee
  // HR_USER     -> Any employee
  // MANAGER     -> Own department
  // EMPLOYEE    -> Own employee record
  // ============================================================

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.HR_USER,
    UserRole.DEPARTMENT_MANAGER,
    UserRole.EMPLOYEE,
  )
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.employeesService.findOne(id, req.user);
  }

  // ============================================================
  // UPDATE EMPLOYEE
  //
  // ADMIN
  // HR_USER
  // ============================================================

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_USER)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  // ============================================================
  // UPDATE EMPLOYEE STATUS
  //
  // ADMIN
  // HR_USER
  // ============================================================

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.HR_USER)
  updateStatus(
    @Param('id') id: string,
    @Body() updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(id, updateEmployeeStatusDto);
  }
}
