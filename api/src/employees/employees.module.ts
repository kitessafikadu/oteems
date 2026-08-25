import { Module } from '@nestjs/common';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeeAccessService } from './employee-access.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeeAccessService],
  exports: [EmployeesService, EmployeeAccessService],
})
export class EmployeesModule {}
