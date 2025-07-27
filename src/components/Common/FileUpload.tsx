import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import ProgressBar from './ProgressBar';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  uploadProgress?: Record<string, number>;
  onRemoveFile?: (fileName: string) => void;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  multiple = true,
  className,
  disabled = false,
  uploadProgress = {},
  onRemoveFile,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors: string[] = [];
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          switch (error.code) {
            case 'file-too-large':
              newErrors.push(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด ${formatFileSize(maxFileSize)})`);
              break;
            case 'file-invalid-type':
              newErrors.push(`ไฟล์ ${file.name} ไม่ใช่ประเภทที่รองรับ`);
              break;
            case 'too-many-files':
              newErrors.push(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`);
              break;
            default:
              newErrors.push(`เกิดข้อผิดพลาดกับไฟล์ ${file.name}`);
          }
        });
      });
      setErrors(newErrors);
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const filesWithPreview = acceptedFiles.map(file => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });

      setSelectedFiles(prev => {
        const newFiles = multiple ? [...prev, ...filesWithPreview] : filesWithPreview;
        return newFiles.slice(0, maxFiles);
      });

      onFilesSelected(acceptedFiles);
    }
  }, [maxFileSize, maxFiles, multiple, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled,
  });

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(file => file.name !== fileName);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(file => file.name === fileName);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
    
    if (onRemoveFile) {
      onRemoveFile(fileName);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return PhotoIcon;
    if (file.type.startsWith('video/')) return VideoCameraIcon;
    if (file.type.startsWith('audio/')) return SpeakerWaveIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={clsx(
          'file-upload-area',
          {
            'dragover': isDragActive,
            'opacity-50 cursor-not-allowed': disabled,
            'cursor-pointer': !disabled,
          }
        )}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          {isDragActive ? (
            <p className="text-lg font-medium text-police-600">วางไฟล์ที่นี่...</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900">
                ลากและวางไฟล์ หรือ <span className="text-police-600">คลิกเพื่อเลือก</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                รองรับไฟล์: รูปภาพ, วิดีโอ, เสียง, เอกสาร (สูงสุด {formatFileSize(maxFileSize)})
              </p>
              {multiple && (
                <p className="text-sm text-gray-500">
                  สามารถเลือกได้สูงสุด {maxFiles} ไฟล์
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            ไฟล์ที่เลือก ({selectedFiles.length})
          </h4>
          <div className="space-y-3">
            {selectedFiles.map((file) => {
              const FileIcon = getFileIcon(file);
              const progress = uploadProgress[file.name];
              
              return (
                <div
                  key={file.name}
                  className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0 mr-3">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <FileIcon className="h-10 w-10 text-gray-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Upload Progress */}
                    {typeof progress === 'number' && progress < 100 && (
                      <div className="mt-2">
                        <ProgressBar
                          progress={progress}
                          size="sm"
                          showPercentage
                          label="กำลังอัปโหลด..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="flex-shrink-0 ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={typeof progress === 'number' && progress > 0 && progress < 100}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;