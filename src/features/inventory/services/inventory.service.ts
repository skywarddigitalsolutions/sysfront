import { httpClient } from '@/lib/http/httpClient';
import { EventProductInventory, EventSupplyInventory, LoadProductsDto, LoadSuppliesDto } from '../types';

export const inventoryService = {
    // Products
    getEventProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products`);
    },

    getAvailableProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products/available`);
    },

    getLowStockProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products/low-stock`);
    },

    loadProducts: async (eventId: string, data: LoadProductsDto) => {
        return httpClient.post(`/events/${eventId}/inventory/products`, data);
    },

    // Supplies
    getEventSupplies: async (eventId: string) => {
        return httpClient.get<EventSupplyInventory[]>(`/events/${eventId}/inventory/supplies`);
    },

    getAvailableSupplies: async (eventId: string) => {
        return httpClient.get<EventSupplyInventory[]>(`/events/${eventId}/inventory/supplies/available`);
    },

    getLowStockSupplies: async (eventId: string) => {
        return httpClient.get<EventSupplyInventory[]>(`/events/${eventId}/inventory/supplies/low-stock`);
    },

    loadSupplies: async (eventId: string, data: LoadSuppliesDto) => {
        return httpClient.post(`/events/${eventId}/inventory/supplies`, data);
    },
};
