import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { addDocument } from './firestore';

interface FileMetadata {
    name: string;
    size: number;
    type: string;
    ownerId: string;
}

export const uploadFile = (
    file: File,
    path: string,
    metadata: FileMetadata,
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Save metadata to Firestore
                    await addDocument('files', {
                        ...metadata,
                        url: downloadURL,
                        storagePath: storageRef.fullPath,
                    });

                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};
