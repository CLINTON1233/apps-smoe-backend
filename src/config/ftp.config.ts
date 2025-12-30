export const ftpConfig = {
  host: process.env.FTP_HOST || '10.5.252.44',
  port: parseInt(process.env.FTP_PORT || '21'),
  user: process.env.FTP_USERNAME || 'it.Installer', 
  password: process.env.FTP_PASSWORD || 'Syst3m32',
  secure: process.env.FTP_SECURE === 'true',
  basePath: process.env.FTP_BASE_PATH || '/IT_Departemen/Installer', 
  timeout: 30000,
};