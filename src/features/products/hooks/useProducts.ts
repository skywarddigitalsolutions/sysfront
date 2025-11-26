import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';

export const useAvailableProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['products', 'available', eventId],
        queryFn: () => productsApi.getAvailableProducts(eventId),
        enabled: !!eventId,
    });
};

export const useProductRecipe = (productId: string) => {
    return useQuery({
        queryKey: ['products', 'recipe', productId],
        queryFn: () => productsApi.getProductRecipe(productId),
        enabled: !!productId,
    });
};
