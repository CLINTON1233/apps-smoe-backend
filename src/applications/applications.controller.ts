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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApplicationsService } from './applications.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getAllApplications(@Res() res: Response) {
    try {
      const applications = await this.applicationsService.findAll();
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: applications,
        message: 'Applications retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve applications',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string, @Res() res: Response) {
    try {
      const application = await this.applicationsService.findById(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: application,
        message: 'Application retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve application',
      });
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createApplication(
    @Body() applicationData: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const newApplication = await this.applicationsService.create(
        applicationData,
        file,
      );
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: newApplication,
        message: 'Application created successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to create application',
      });
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateApplication(
    @Param('id') id: string,
    @Body() applicationData: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const updatedApplication = await this.applicationsService.update(
        parseInt(id),
        applicationData,
        file,
      );
      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: updatedApplication,
        message: 'Application updated successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update application',
      });
    }
  }

  @Delete(':id')
  async deleteApplication(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.applicationsService.delete(parseInt(id));
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Application deleted successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to delete application',
      });
    }
  }

  @Post(':id/download')
  async downloadApplication(@Param('id') id: string, @Res() res: Response) {
    try {
      const application = await this.applicationsService.incrementDownloadCount(
        parseInt(id),
      );

      if (!application.file_path) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'error',
          message: 'No file available for download',
        });
      }

      const filePath = path.join(
        process.cwd(),
        'public',
        application.file_path,
      );

      if (!fs.existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'error',
          message: 'File not found',
        });
      }

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${application.file_name}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');

      return res.sendFile(filePath);
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to download application',
      });
    }
  }

  @Get(':id/file-info')
  async getFileInfo(@Param('id') id: string, @Res() res: Response) {
    try {
      const application = await this.applicationsService.findById(parseInt(id));

      return res.status(HttpStatus.OK).json({
        status: 'success',
        data: {
          file_name: application.file_name,
          file_size: application.file_size,
          file_type: application.file_type,
          download_count: application.download_count,
        },
        message: 'File information retrieved successfully',
      });
    } catch (error) {
      const status = error.getStatus
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to retrieve file information',
      });
    }
  }
}
