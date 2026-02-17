import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export const DebugFirestore = () => {
    const [status, setStatus] = useState('Idle');
    const [error, setError] = useState('');

    const testConnection = async () => {
        setStatus('Testing...');
        setError('');
        try {
            // Try to write
            await addDoc(collection(db, 'debug_test'), {
                timestamp: new Date(),
                test: 'connectivity'
            });
            setStatus('Write Success!');

            // Try to read
            const querySnapshot = await getDocs(collection(db, 'debug_test'));
            setStatus(`Read Success! Found ${querySnapshot.size} docs`);
        } catch (err: any) {
            console.error("Debug Error:", err);
            setStatus('Failed');
            setError(err.message);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mt-4 border border-yellow-500">
            <h3 className="font-bold mb-2 text-black dark:text-white">Diagnóstico de Conexión</h3>
            <button
                onClick={testConnection}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
                Probar Conexión Firestore
            </button>
            <div className="mt-2 text-sm">
                <div className="text-black dark:text-white">Estado: <strong>{status}</strong></div>
                {error && <div className="text-red-500 break-all font-mono text-xs mt-1">{error}</div>}
            </div>
        </div>
    );
};
