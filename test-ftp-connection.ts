// test-ftp-connection.ts
import { FtpService } from './src/shared/ftp.service';

async function testFtpConnection() {
  const ftpService = new FtpService();
  
  try {
    console.log('Testing FTP connection...');
    
    // Test list files
    const files = await ftpService.listFiles();
    console.log('Files on FTP server:', files);
    
    // Test upload (gunakan file dummy)
    const testFile = './test.txt';
    require('fs').writeFileSync(testFile, 'Test content');
    
    const uploadResult = await ftpService.uploadFile(testFile, 'test.txt');
    console.log('Upload successful:', uploadResult);
    
    // Cleanup
    require('fs').unlinkSync(testFile);
    
    console.log('✅ FTP connection successful!');
  } catch (error) {
    console.error('❌ FTP connection failed:', error);
  }
}

testFtpConnection();