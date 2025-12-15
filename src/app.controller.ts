import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FtpService } from './common/ftp.service'; 
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
         private readonly ftpService: FtpService,
  ) {}
 

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  // src/app.controller.ts
@Get('ftp/test')
async testFTP() {
  try {
    const isConnected = await this.ftpService.testConnection();
    return {
      status: 'success',
      connected: isConnected,
      config: {
        host: process.env.FTP_HOST,
        port: process.env.FTP_PORT,
        user: process.env.FTP_USER,
        baseUrl: process.env.FTP_BASE_URL,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}
}