import { httpClient } from '@/lib/http/httpClient';
import { EventProductInventory, ProductSupply } from '../types';

export const productsApi = {
    getAvailableProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products/available`);
    },

    getProductRecipe: async (productId: string) => {
        return httpClient.get<ProductSupply[]>(`/products/${productId}/supplies`);
    },
};
