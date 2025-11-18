import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  

  async validateUser(email: string, password: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      // Find user by email
      const user = await this.usersService.findByEmailForAuth(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if password matches
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword
      };

    } catch (error) {
      console.error('Auth validation error:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
}