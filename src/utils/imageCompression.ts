import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const defaultOptions: imageCompression.Options = {
    maxWidthOrHeight: options.maxWidthOrHeight || 1200,
    maxSizeMB: options.maxSizeMB || 0.5,
    useWebWorker: options.useWebWorker !== false,
    fileType: 'image/webp',
    quality: 0.8,
    initialQuality: 0.8,
  };

  try {
    const compressed = await imageCompression(file, defaultOptions);
    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try again.');
  }
}

export async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function getFileSizeInMB(blob: Blob): Promise<number> {
  return blob.size / (1024 * 1024);
}
