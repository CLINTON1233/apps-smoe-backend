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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { IconsService } from './icons.service';

@Controller('icons')
export class IconsController {
  constructor(private readonly iconsService: IconsService) {}

  @Get()
  async getAllIcons(@Res() res: Response) {
    try {
      const icons = await this.iconsService.findAll();
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

  @Post('system')
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

  @Post('custom')
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

      const icon = await this.iconsService.createCustomIcon(
        file,
        body.name || file.originalname,
      );
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: icon,
        message: 'Custom icon created successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to create custom icon',
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
}
