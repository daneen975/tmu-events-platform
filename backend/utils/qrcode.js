import QRCode from 'qrcode';
import crypto from 'crypto';

// Generate unique QR code string
export const generateUniqueCode = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate QR code as Data URL (for frontend display)
export const generateQRCodeDataURL = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

// Generate QR code as Buffer (for email attachment)
export const generateQRCodeBuffer = async (data) => {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
    });
    return qrCodeBuffer;
  } catch (error) {
    console.error('QR Code buffer generation error:', error);
    throw error;
  }
};