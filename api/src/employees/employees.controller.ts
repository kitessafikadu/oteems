import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { EmployeesService } from './employees.service';

import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(id, updateEmployeeStatusDto);
  }
}
