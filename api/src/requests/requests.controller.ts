import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { RequestsService } from './requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { RejectLeaveRequestDto } from './dto/reject-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    userId?: string;
    employeeId?: string;
    username: string;
    role: string;
  };
}

@ApiTags('Leave Requests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create and submit a leave request',
    description:
      'Creates a new leave request for the authenticated employee and immediately submits it for review.',
  })
  @ApiResponse({
    status: 201,
    description: 'Leave request created and submitted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid dates or request data.' })
  @ApiResponse({
    status: 409,
    description: 'The employee already has an overlapping leave request.',
  })
  createRequest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.requestsService.createRequest(this.getUserId(req), dto);
  }

  @Get('my')
  @ApiOperation({
    summary: 'View my leave requests',
    description:
      'Returns all leave requests belonging to the authenticated employee.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee leave requests returned successfully.',
  })
  getMyRequests(@Req() req: AuthenticatedRequest) {
    return this.requestsService.getMyRequests(this.getUserId(req));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edit a leave request',
    description:
      'Allows the employee to edit a draft or rejected leave request before submitting or resubmitting it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request updated successfully.',
  })
  updateRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.requestsService.updateRequest(
      this.getUserId(req),
      requestId,
      dto,
    );
  }

  @Patch(':id/submit')
  @ApiOperation({
    summary: 'Submit a draft leave request',
    description:
      'Changes a draft leave request to SUBMITTED so that it can be reviewed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request submitted successfully.',
  })
  submitRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
  ) {
    return this.requestsService.submitRequest(this.getUserId(req), requestId);
  }

  @Patch(':id/resubmit')
  @ApiOperation({
    summary: 'Resubmit a rejected leave request',
    description:
      'Resubmits a rejected request after the employee has corrected or updated its information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request resubmitted successfully.',
  })
  resubmitRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
  ) {
    return this.requestsService.resubmitRequest(this.getUserId(req), requestId);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a leave request',
    description:
      'Allows the employee to cancel a draft or submitted leave request. The request remains in the database with CANCELLED status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request cancelled successfully.',
  })
  cancelRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
  ) {
    return this.requestsService.cancelRequest(this.getUserId(req), requestId);
  }

  @Get('department')
  @ApiOperation({
    summary: 'View department leave requests',
    description:
      'Returns leave requests belonging to employees in the authenticated department manager’s department.',
  })
  @ApiResponse({
    status: 200,
    description: 'Department leave requests returned successfully.',
  })
  getDepartmentRequests(@Req() req: AuthenticatedRequest) {
    return this.requestsService.getDepartmentRequests(this.getUserId(req));
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve a leave request',
    description:
      'Approves a submitted leave request. Department managers can only approve requests belonging to their own department. HR and Admin can approve any request.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request approved successfully.',
  })
  approveRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
  ) {
    return this.requestsService.approveRequest(this.getUserId(req), requestId);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject a leave request',
    description:
      'Rejects a submitted leave request. A rejection reason is required. The employee can later edit and resubmit the request.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request rejected successfully.',
  })
  rejectRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
    @Body() dto: RejectLeaveRequestDto,
  ) {
    return this.requestsService.rejectRequest(
      this.getUserId(req),
      requestId,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'View all leave requests',
    description:
      'Returns all leave requests. Only ADMIN and HR_USER can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'All leave requests returned successfully.',
  })
  getAllRequests(@Req() req: AuthenticatedRequest) {
    return this.requestsService.getAllRequests(this.getUserId(req));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'View a leave request',
    description:
      'Returns a leave request and its workflow history. Employees can view their own requests, department managers can view requests in their department, and HR/Admin can view all requests.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request returned successfully.',
  })
  getRequestById(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
  ) {
    return this.requestsService.getRequestById(this.getUserId(req), requestId);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: 'View leave request history',
    description:
      'Returns the complete audit history of a leave request, including creation, submission, rejection, resubmission, approval, and cancellation actions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request history returned successfully.',
  })
  getRequestHistory(
    @Req() req: AuthenticatedRequest,
    @Param('id') requestId: string,
  ) {
    return this.requestsService.getRequestHistory(
      this.getUserId(req),
      requestId,
    );
  }

  private getUserId(req: AuthenticatedRequest): string {
    return req.user.id ?? req.user.userId!;
  }
}
