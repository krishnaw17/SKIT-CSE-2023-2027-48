import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';
import { UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
  format?: string,
  originalFilename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const options: any = { folder, resource_type: resourceType };
    if (format) options.format = format;
    if (originalFilename) {
      const uniqueId = crypto.randomBytes(8).toString('hex');
      // Replace spaces and special chars to make it URL safe
      const safeName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
      options.public_id = `${uniqueId}_${safeName}`;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
