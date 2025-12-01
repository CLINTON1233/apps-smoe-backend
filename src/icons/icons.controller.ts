import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { IconsService } from './icons.service';

@Controller('icons')
export class IconsController {
  constructor(private readonly iconsService: IconsService) {}

  @Get()
  async getAllIcons(@Res() res: Response, @Query('search') search?: string) {
    try {
      let icons;
      if (search) {
        icons = await this.iconsService.searchIcons(search);
      } else {
        icons = await this.iconsService.findAll();
      }
      
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: icons,
        message: 'Icons retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve icons',
      });
    }
  }

  @Get('system/create')
  async createSystemIcons(@Res() res: Response) {
    try {
      const result = await this.iconsService.createSystemIcons();
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: result,
        message: 'System icons created successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to create system icons',
      });
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createCustomIcon(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'File is required',
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Only image files are allowed (JPEG, PNG, SVG, WebP)',
        });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'File size must be less than 5MB',
        });
      }

      const icon = await this.iconsService.createCustomIcon(
        file,
        body.name,
        body.category,
      );
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: icon,
        message: 'Custom icon uploaded successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to upload custom icon',
      });
    }
  }

  @Delete(':id')
  async deleteIcon(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.iconsService.delete(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: result,
        message: 'Icon deleted successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to delete icon',
      });
    }
  }

  @Get(':id')
  async getIconById(@Param('id') id: string, @Res() res: Response) {
    try {
      const icon = await this.iconsService.findById(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: icon,
        message: 'Icon retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve icon',
      });
    }
  }
}