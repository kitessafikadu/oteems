import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignDepartmentManagerDto } from './dto/assign-department-manager.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '../../generated/prisma/client';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HR_USER)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // USER MANAGEMENT

  @Post('users')
  createUser(@Req() req: any, @Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto, req.user.role);
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string) {
    return this.adminService.findUserById(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  // DEPARTMENT MANAGEMENT

  @Post('departments')
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.adminService.createDepartment(createDepartmentDto);
  }

  @Get('departments')
  findAllDepartments() {
    return this.adminService.findAllDepartments();
  }

  @Get('departments/:id')
  findDepartmentById(@Param('id') id: string) {
    return this.adminService.findDepartmentById(id);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.adminService.updateDepartment(id, updateDepartmentDto);
  }

  @Patch('departments/:departmentId/manager')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign or change department manager',
    description:
      'Assigns an active employee as the manager of an existing department. If another manager is currently assigned, they will be replaced.',
  })
  @ApiResponse({
    status: 200,
    description: 'Department manager assigned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'The employee is inactive or the department has invalid data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Department or employee not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'The employee is already managing another department.',
  })
  assignDepartmentManager(
    @Param('departmentId') departmentId: string,
    @Body() assignDepartmentManagerDto: AssignDepartmentManagerDto,
  ) {
    return this.adminService.assignDepartmentManager(
      departmentId,
      assignDepartmentManagerDto,
    );
  }

  @Delete('departments/:departmentId/manager')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Remove department manager',
    description:
      'Removes the currently assigned manager from an existing department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Department manager removed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'The department does not have a manager.',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found.',
  })
  removeDepartmentManager(@Param('departmentId') departmentId: string) {
    return this.adminService.removeDepartmentManager(departmentId);
  }
}
