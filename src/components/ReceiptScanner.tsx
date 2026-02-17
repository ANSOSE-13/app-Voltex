import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import clsx from 'clsx';

interface ScannedData {
    amount?: number;
    date?: Date;
    merchant?: string;
    text: string;
}

interface ReceiptScannerProps {
    onScanComplete: (data: ScannedData) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScanComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const processImage = async (file: File) => {
        setScanning(true);
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            console.log("OCR Text:", text);

            // Simple parsing logic
            const data: ScannedData = { text };

            // 1. Amount: Look for "Total" followed by a number, or just the largest number with 2 decimals
            // Regex for currency: $12.34, 12.34
            const amountRegex = /(?:total|amount|due|pay).*?[\$£€]?\s*(\d+[.,]\d{2})/i;
            const amountMatch = text.match(amountRegex);

            if (amountMatch) {
                // normalize , to .
                const amountStr = amountMatch[1].replace(',', '.');
                data.amount = parseFloat(amountStr);
            } else {
                // Fallback: Find all numbers with 2 decimals and take the largest one (risky but common for "Total")
                const allNumbers = text.match(/\d+[.,]\d{2}/g);
                if (allNumbers) {
                    const numbers = allNumbers.map(n => parseFloat(n.replace(',', '.')));
                    data.amount = Math.max(...numbers);
                }
            }

            // 2. Date: MM/DD/YYYY or DD/MM/YYYY or similar
            const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;
            const dateMatch = text.match(dateRegex);
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    data.date = date;
                }
            }

            // 3. Merchant: First non-empty line usually
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length > 0) {
                data.merchant = lines[0];
            }

            onScanComplete(data);

        } catch (err) {
            console.error(err);
            alert('Failed to scan receipt.');
        } finally {
            setScanning(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                capture="environment" // Opens camera on mobile
                className="hidden"
                id="receipt-upload"
                onChange={handleFileChange}
                disabled={scanning}
            />
            <label
                htmlFor="receipt-upload"
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    scanning ? "opacity-50 cursor-not-allowed" : ""
                )}
            >
                {scanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {scanning ? `Scanning ${progress}%` : "Scan Receipt"}
                </span>
            </label>
        </div>
    );
};

export default ReceiptScanner;
