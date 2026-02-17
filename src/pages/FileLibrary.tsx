import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFirestoreCollection } from '../hooks/useFirestore';
import FileUploader from '../components/FileUploader';
import { FileText, Music, Image as ImageIcon, Trash2, Download, ExternalLink } from 'lucide-react';
import { deleteDocument } from '../services/firestore';
import clsx from 'clsx';

interface FileData {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: any;
    ownerId: string;
}

const FileLibrary: React.FC = () => {
    const { t } = useTranslation();
    // const { user } = useAuthStore();
    // const { data: files, loading } = useFirestoreCollection<FileData>('files', [where('ownerId', '==', user?.uid)]);

    const { data: files, loading } = useFirestoreCollection<FileData>('files');
    const [isUploading, setIsUploading] = React.useState(false);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            await deleteDocument('files', id);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="text-purple-500" size={24} />;
        if (type.startsWith('audio/')) return <Music className="text-pink-500" size={24} />;
        return <FileText className="text-blue-500" size={24} />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('files')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your documents and media assets</p>
                </div>
                <button
                    onClick={() => setIsUploading(!isUploading)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                >
                    {isUploading ? 'Cancel Upload' : t('upload')}
                </button>
            </div>

            {/* Upload Area with Animation */}
            <div className={clsx(
                "transition-all duration-300 overflow-hidden",
                isUploading ? "max-h-96 opacity-100 mb-8" : "max-h-0 opacity-0"
            )}>
                <FileUploader onUploadComplete={() => setIsUploading(false)} />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-48 animate-pulse" />
                    ))}
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No files uploaded yet.</p>
                    <button onClick={() => setIsUploading(true)} className="text-blue-600 font-medium mt-2 hover:underline">Upload your first file</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {files.map((file) => (
                        <div key={file.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow relative">
                            {/* Preview Area */}
                            <div className="h-40 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                ) : (
                                    <div className="transform transition-transform duration-300 group-hover:scale-110">
                                        {getFileIcon(file.type)}
                                    </div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-colors"
                                        title="Open"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                    <a
                                        href={file.url}
                                        download
                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-colors"
                                        title="Download"
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* File Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate pr-4" title={file.name}>{file.name}</h3>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    <span>{formatSize(file.size)}</span>
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileLibrary;
