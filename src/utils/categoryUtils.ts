
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'burger', 'pizza', 'sushi', 'lunch', 'dinner', 'breakfast', 'grocery', 'supermarket', 'walmart', 'whole foods', 'trader joes'],
    'Transport': ['uber', 'lyft', 'taxi', 'bus', 'train', 'subway', 'metro', 'gas', 'fuel', 'parking', 'airline', 'flight', 'delta', 'united', 'american airlines'],
    'Entertainment': ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'cinema', 'movie', 'concert', 'ticket', 'game', 'steam', 'playstation', 'xbox', 'nintendo'],
    'Housing': ['rent', 'mortgage', 'utility', 'electric', 'water', 'gas', 'internet', 'wifi', 'cleaning', 'maintenance'],
    'Health': ['doctor', 'hospital', 'pharmacy', 'cvs', 'walgreens', 'gym', 'fitness', 'yoga', 'medicine', 'dental', 'vision'],
    'Education': ['course', 'tuition', 'book', 'school', 'university', 'college', 'udemy', 'coursera', 'pluralsight'],
    'Shopping': ['amazon', 'ebay', 'target', 'best buy', 'clothing', 'shoes', 'electronics'],
    'Salary': ['salary', 'payroll', 'employer', 'deposit'],
    'Freelance': ['upwork', 'fiverr', 'contract', 'client'],
    'Investments': ['dividend', 'interest', 'stock', 'crypto', 'coinbase', 'robinhood']
};

export const suggestCategory = (description: string): string | null => {
    const lowerDesc = description.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword)) {
                return category;
            }
        }
    }

    return null;
};
