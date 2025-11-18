import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './categories.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll() {
    try {
      const categories = await this.categoriesRepository.find({
        order: { id: 'ASC' },
      });
      return categories;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: number) {
    try {
      const category = await this.categoriesRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return category;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(categoryData: any) {
    try {
      if (!categoryData.name) {
        throw new HttpException(
          'Category name is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if category already exists
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: categoryData.name },
      });

      if (existingCategory) {
        throw new HttpException('Category already exists', HttpStatus.CONFLICT);
      }

      const newCategory = this.categoriesRepository.create({
        name: categoryData.name.trim(),
        description: categoryData.description || '',
      });

      const savedCategory = await this.categoriesRepository.save(newCategory);
      return savedCategory;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, categoryData: any) {
    try {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { id },
      });

      if (!existingCategory) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // Check if name already exists (excluding current category)
      if (categoryData.name && categoryData.name !== existingCategory.name) {
        const categoryWithSameName = await this.categoriesRepository.findOne({
          where: { name: categoryData.name },
        });

        if (categoryWithSameName) {
          throw new HttpException(
            'Category name already exists',
            HttpStatus.CONFLICT,
          );
        }
      }

      const updateData = {
        name: categoryData.name || existingCategory.name,
        description:
          categoryData.description !== undefined
            ? categoryData.description
            : existingCategory.description,
      };

      await this.categoriesRepository.update(id, updateData);

      return await this.categoriesRepository.findOne({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number) {
    try {
      const categoryToDelete = await this.categoriesRepository.findOne({
        where: { id },
        relations: ['applications'],
      });

      if (!categoryToDelete) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // Check if category has applications
      if (
        categoryToDelete.applications &&
        categoryToDelete.applications.length > 0
      ) {
        throw new HttpException(
          'Cannot delete category with existing applications',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.categoriesRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
