import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ImageUploadService } from '@/services/imageUpload';
import { ImagePlus, X, Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  userId: string;
  maxImages?: number;
  existingImages?: string[];
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  userId,
  maxImages = 5,
  existingImages = [],
  className
}) => {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(existingImages);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalImages = imageUrls.length + uploadingFiles.length + fileArray.length;

    if (totalImages > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive"
      });
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = ImageUploadService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive"
        });
      }
    }

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    validFiles.forEach(async (file, index) => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(uf => 
            uf.file === file ? { ...uf, progress: Math.min(uf.progress + 10, 90) } : uf
          ));
        }, 100);

        const result = await ImageUploadService.uploadImage(file, userId);

        clearInterval(progressInterval);

        if (result.url) {
          // Success
          setUploadingFiles(prev => prev.map(uf => 
            uf.file === file ? { ...uf, progress: 100, url: result.url } : uf
          ));

          setImageUrls(prev => {
            const newUrls = [...prev, result.url!];
            onImagesChange(newUrls);
            return newUrls;
          });

          // Remove from uploading after a short delay
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(uf => uf.file !== file));
          }, 1000);
        } else {
          // Error
          setUploadingFiles(prev => prev.map(uf => 
            uf.file === file ? { ...uf, progress: 0, error: result.error } : uf
          ));
        }
      } catch (error) {
        setUploadingFiles(prev => prev.map(uf => 
          uf.file === file ? { ...uf, progress: 0, error: 'Upload failed' } : uf
        ));
      }
    });
  }, [imageUrls.length, uploadingFiles.length, maxImages, userId, onImagesChange, toast]);

  const handleRemoveImage = useCallback(async (url: string, index: number) => {
    try {
      // Remove from UI immediately
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
      onImagesChange(newUrls);

      // Delete from storage in background
      await ImageUploadService.deleteImage(url);
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image from storage.",
        variant: "destructive"
      });
    }
  }, [imageUrls, onImagesChange, toast]);

  const handleRetryUpload = useCallback((uploadingFile: UploadingFile) => {
    setUploadingFiles(prev => prev.map(uf => 
      uf === uploadingFile ? { ...uf, progress: 0, error: undefined } : uf
    ));

    // Retry upload
    handleFileSelect((() => {
      const dt = new DataTransfer();
      dt.items.add(uploadingFile.file);
      return dt.files;
    })());
  }, [handleFileSelect]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to 5MB each (max {maxImages} images)
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading...</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                {uploadingFile.error ? (
                  <div className="flex items-center gap-2 mt-1">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-xs text-destructive">{uploadingFile.error}</p>
                  </div>
                ) : (
                  <Progress value={uploadingFile.progress} className="mt-1" />
                )}
              </div>
              {uploadingFile.error && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRetryUpload(uploadingFile)}
                >
                  Retry
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {imageUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images ({imageUrls.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(url, index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button (alternative) */}
      {imageUrls.length + uploadingFiles.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload')?.click()}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Add More Images ({imageUrls.length}/{maxImages})
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;