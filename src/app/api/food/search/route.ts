import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ items: [] });
    }

    try {
        // Open Food Facts API Search
        // Using kr.openfoodfacts.org for better local relevance if possible, or world for broad support.
        // pagesize=20 for efficiency
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,nutriments,image_url,code,brands`
        );

        if (!response.ok) {
            throw new Error('Open Food Facts API request failed');
        }

        const data = await response.json();

        // Transform to our internal format
        const items = (data.products || []).map((product: any) => ({
            name: product.product_name || 'Unknown Product',
            brand: product.brands || '',
            calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0,
            macros: {
                carbs: product.nutriments?.carbohydrates_100g || 0,
                protein: product.nutriments?.proteins_100g || 0,
                fat: product.nutriments?.fat_100g || 0,
            },
            image: product.image_url || null,
            servingSize: '100g' // OFF usually standardizes to 100g/100ml. Not always perfect but good baseline.
        }));

        return NextResponse.json({ items });

    } catch (error) {
        console.error('Food Search API Error:', error);
        return NextResponse.json({ items: [], error: 'Failed to fetch food data' }, { status: 500 });
    }
}
