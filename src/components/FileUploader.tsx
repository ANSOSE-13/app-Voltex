import React, { useCallback, useState } from 'react';
import { Upload, X, File as FileIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { uploadFile } from '../services/storage';
import clsx from 'clsx';

const FileUploader: React.FC<{ onUploadComplete: () => void }> = ({ onUploadComplete }) => {
    const { user } = useAuthStore();
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setStatus('idle');
            setProgress(0);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file || !user) return;

        setStatus('uploading');
        try {
            await uploadFile(
                file,
                `users/${user.uid}/uploads`,
                {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    ownerId: user.uid
                },
                (prog) => setProgress(prog)
            );
            setStatus('success');
            setTimeout(() => {
                setFile(null);
                setStatus('idle');
                onUploadComplete();
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error.message || 'Upload failed');
        }
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    className={clsx(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                        isDragging
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,audio/*"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Upload size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Images, PDF, Audio (max 10MB)
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <FileIcon size={20} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="grid">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        {status === 'idle' && (
                            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-500">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {status === 'idle' && (
                        <button
                            onClick={handleUpload}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Upload File
                        </button>
                    )}

                    {status === 'uploading' && (
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-right text-gray-500">{Math.round(progress)}%</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            <CheckCircle size={16} className="mr-2" /> Upload Complete
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center text-red-600 text-sm font-medium">
                            <AlertCircle size={16} className="mr-2" /> {errorMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
