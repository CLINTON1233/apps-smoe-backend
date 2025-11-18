import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: any, @Res() res: Response) {
    try {
      const { email, password } = loginData;

      // Validate required fields
      if (!email || !password) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      const result = await this.authService.validateUser(email, password);
      
      if (!result.success) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: 'error',
          message: result.message
        });
      }

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: {
          user: result.user
        },
        message: 'Login successful'
      });

    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Login failed. Please try again.'
      });
    }
  }
}