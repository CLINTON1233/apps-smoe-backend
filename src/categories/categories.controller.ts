import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(@Res() res: Response) {
    try {
      const categories = await this.categoriesService.findAll();
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: categories,
        message: 'Categories retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve categories',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string, @Res() res: Response) {
    try {
      const category = await this.categoriesService.findById(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: category,
        message: 'Category retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve category',
      });
    }
  }

  @Post()
  async createCategory(@Body() categoryData: any, @Res() res: Response) {
    try {
      const newCategory = await this.categoriesService.create(categoryData);
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: newCategory,
        message: 'Category created successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to create category',
      });
    }
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() categoryData: any,
    @Res() res: Response,
  ) {
    try {
      const updatedCategory = await this.categoriesService.update(
        parseInt(id),
        categoryData,
      );
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: updatedCategory,
        message: 'Category updated successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update category',
      });
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.categoriesService.delete(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to delete category',
      });
    }
  }
}
