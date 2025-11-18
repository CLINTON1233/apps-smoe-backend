import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(@Res() res: Response) {
    try {
      const users = await this.usersService.findAll();
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve users',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findById(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve user'
      });
    }
  }

  @Post()
  async createUser(@Body() userData: any, @Res() res: Response) {
    try {
      const newUser = await this.usersService.create(userData);
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to create user'
      });
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userData: any, @Res() res: Response) {
    try {
      const updatedUser = await this.usersService.update(parseInt(id), userData);
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update user'
      });
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.usersService.delete(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to delete user'
      });
    }
  }
}