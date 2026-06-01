import { useState } from 'react';

export function useImageAttachments() {
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleAddImages = async (files: FileList | File[] | any) => {
    const fileListArray = Array.from(files) as any[];
    const imageFiles = fileListArray.filter((f) => f && f.type && f.type.startsWith('image/')) as File[];
    if (imageFiles.length === 0) return;

    const base64Promises = imageFiles.map((file) => fileToBase64(file));
    try {
      const base64s = await Promise.all(base64Promises);
      setPendingImages((prev) => [...prev, ...base64s]);
    } catch (err) {
      console.error('Error reading image file:', err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const fileListArray = Array.from(e.clipboardData.files) as any[];
      const imageFiles = fileListArray.filter((f) => f && f.type && f.type.startsWith('image/')) as File[];
      if (imageFiles.length > 0) {
        e.preventDefault();
        handleAddImages(imageFiles);
      }
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    pendingImages,
    setPendingImages,
    handleAddImages,
    handlePaste,
    removePendingImage
  };
}
