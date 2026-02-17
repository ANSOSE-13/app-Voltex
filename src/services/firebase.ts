import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";



const firebaseConfig = {
    apiKey: "AIzaSyA488jmPd6ajXEkk2PFecFz_a_5nIxi07Y",
    authDomain: "app-finanzas-49bdb.firebaseapp.com",
    projectId: "app-finanzas-49bdb",
    storageBucket: "app-finanzas-49bdb.firebasestorage.app",
    messagingSenderId: "848270058954",
    appId: "1:848270058954:web:ba4c00264c2ac9b7315b33",
    measurementId: "G-C8YLX13ZL4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
    experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
