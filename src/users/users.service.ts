import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    try {
      const users = await this.usersRepository.find({
        select: ['id', 'nama', 'email', 'badge', 'telp', 'departemen', 'role', 'created_at'],
        order: { id: 'ASC' }
      });
      return users;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        select: ['id', 'nama', 'email', 'badge', 'telp', 'departemen', 'role', 'created_at']
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { email: email.toLowerCase() },
        select: ['id', 'nama', 'email', 'badge', 'telp', 'departemen', 'role', 'created_at']
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  // Method khusus untuk auth (include password)
  async findByEmailForAuth(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { email: email.toLowerCase() }
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  async create(userData: any) {
    try {
      // Validate required fields
      if (!userData.nama || !userData.email || !userData.password) {
        throw new HttpException(
          'Name, email, and password are required',
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new HttpException(
          'Email already exists',
          HttpStatus.CONFLICT
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create new user
      const newUser = this.usersRepository.create({
        nama: userData.nama.trim(),
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
        badge: userData.badge || '',
        telp: userData.telp || '',
        departemen: userData.departemen || '',
        role: userData.role || 'guest',
      });

      const savedUser = await this.usersRepository.save(newUser);

      // Return user without password
      const { password, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, userData: any) {
    try {
      // Find existing user
      const existingUser = await this.usersRepository.findOne({
        where: { id }
      });

      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Update user data
      const updateData: any = {
        nama: userData.nama || existingUser.nama,
        badge: userData.badge !== undefined ? userData.badge : existingUser.badge,
        telp: userData.telp !== undefined ? userData.telp : existingUser.telp,
        departemen: userData.departemen !== undefined ? userData.departemen : existingUser.departemen,
        role: userData.role || existingUser.role,
      };

      // Update password only if provided and not empty
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = await bcrypt.hash(userData.password, 12);
      }

      // Perform update
      await this.usersRepository.update(id, updateData);

      // Get updated user
      const updatedUser = await this.usersRepository.findOne({
        where: { id },
        select: ['id', 'nama', 'email', 'badge', 'telp', 'departemen', 'role', 'created_at']
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: number) {
    try {
      // Find user to delete
      const userToDelete = await this.usersRepository.findOne({
        where: { id }
      });

      if (!userToDelete) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Prevent deleting the last admin user
      if (userToDelete.role === 'admin') {
        const adminUsers = await this.usersRepository.find({
          where: { role: 'admin' }
        });
        if (adminUsers.length <= 1) {
          throw new HttpException(
            'Cannot delete the last admin user',
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Delete user
      const result = await this.usersRepository.delete(id);
      
      if (result.affected === 0) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}