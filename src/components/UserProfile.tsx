import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Camera, Save } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { DebugFirestore } from './DebugFirestore';

const UserProfile: React.FC = () => {
    useTranslation();
    const { profile, loading, initialLoading, error, updateProfile, updateAvatar } = useUser();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');

    // Sincronizar estado local al editar
    React.useEffect(() => {
        if (profile?.displayName) setName(profile.displayName);
    }, [profile]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await updateAvatar(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        await updateProfile({ displayName: name });
        setEditing(false);
    };

    if (initialLoading) return <div>Loading...</div>;
    if (error) return (
        <div className="text-red-500 flex flex-col gap-2">
            <p>Error loading profile: {error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors self-start"
            >
                Retry
            </button>
        </div>
    );
    if (!profile) return <div>Error loading profile (Unknown)</div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Profile</h2>

            <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-200">
                        {profile.photoURL ? (
                            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="w-full h-full p-4 text-gray-400" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>
                {loading && <p className="text-xs text-blue-500 mt-2">Uploading...</p>}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            value={editing ? name : (profile.displayName || '')}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!editing}
                            placeholder="Set a display name"
                        />
                        {editing ? (
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg flex items-center"
                            >
                                <Save size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-900 dark:text-white px-4 rounded-lg text-sm font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50 text-gray-500 cursor-not-allowed"
                        value={profile.email || ''}
                        disabled
                    />
                </div>
            </div>

            <DebugFirestore />
        </div>
    );
};

export default UserProfile;
