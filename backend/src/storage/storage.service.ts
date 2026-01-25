import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly useCloudinary: boolean;

  constructor() {
    // Initialize Cloudinary if credentials are provided
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.useCloudinary = !!(cloudName && apiKey && apiSecret);

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true, // Use HTTPS
      });
      this.logger.log('Cloudinary storage initialized');
    } else {
      this.logger.warn(
        'Cloudinary credentials not found. Image uploads will not work. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
      );
    }
  }

  /**
   * Upload a single image file to Cloudinary
   * @param file Express Multer file object
   * @param folder Optional folder path in Cloudinary (e.g., 'properties')
   * @returns Upload result with URL and metadata
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'bhoomisetu',
  ): Promise<UploadResult> {
    if (!this.useCloudinary) {
      throw new BadRequestException(
        'Image upload service is not configured. Please configure Cloudinary credentials.',
      );
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image size must be less than 10MB');
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              this.logger.error('Cloudinary upload error:', error);
              reject(new BadRequestException(`Failed to upload image: ${error.message}`));
              return;
            }

            if (!result) {
              reject(new BadRequestException('Upload failed: No result returned'));
              return;
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          },
        );

        // Convert buffer to stream
        const stream = new Readable();
        stream.push(file.buffer);
        stream.push(null);
        stream.pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Failed to upload image: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple images
   * @param files Array of Express Multer file objects
   * @param folder Optional folder path in Cloudinary
   * @returns Array of upload results
   */
  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'bhoomisetu',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      return [];
    }

    // Validate number of files (max 20 images)
    if (files.length > 20) {
      throw new BadRequestException('Maximum 20 images allowed per upload');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId Cloudinary public ID of the image
   * @returns Deletion result
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!this.useCloudinary) {
      this.logger.warn('Cloudinary not configured, skipping image deletion');
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}`);
    } catch (error) {
      this.logger.error(`Error deleting image ${publicId}:`, error);
      // Don't throw error, just log it (image might already be deleted)
    }
  }

  /**
   * Check if storage service is configured
   */
  isConfigured(): boolean {
    return this.useCloudinary;
  }
}
