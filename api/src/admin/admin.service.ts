import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const {
      username,
      password,
      role,
      employeeId,
      isActive = true,
    } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    if (employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: {
          id: employeeId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
        employeeId,
        isActive,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    await this.findUserById(id);

    if (updateUserDto.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: {
          id: updateUserDto.employeeId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deactivateUser(id: string) {
    await this.findUserById(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
      },
    });
  }
}
