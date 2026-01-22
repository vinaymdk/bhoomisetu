import { useState } from 'react';
import { propertiesService, UploadedImage } from './properties.service';

export interface ListingImage {
  file: File;
  previewUrl: string;
  isPrimary: boolean;
  uploadedUrl: string;
}

export const useListingForm = () => {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(false);

  // Add files from input
  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
      uploadedUrl: '',
    }));
    setImages((prev) => [...prev, ...fileArray]);
  };

  // Upload selected images
  const handleUploadSelected = async () => {
    if (images.length === 0) return;
    setLoading(true);
    try {
      const uploaded: UploadedImage[] = await propertiesService.uploadPropertyImages(
        images.map((img) => img.file)
      );

      setImages((prev) =>
        prev.map((img, idx) => ({
          ...img,
          uploadedUrl: uploaded[idx]?.url || '',
        }))
      );
      alert('Images uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Set primary image
  const setPrimaryImage = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === idx }))
    );
  };

  // Remove image
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reorder images
  const reorderImages = (from: number, to: number) => {
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setImages(updated);
  };

  return {
    images,
    loading,
    handleAddFiles,
    handleUploadSelected,
    setPrimaryImage,
    removeImage,
    reorderImages,
    setImages,
  };
};
