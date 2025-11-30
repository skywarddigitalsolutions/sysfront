import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import type { LoadProductsDto, LoadSuppliesDto } from '../types';

export const useEventProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'products', eventId],
        queryFn: () => inventoryService.getEventProducts(eventId),
        enabled: !!eventId,
    });
};

export const useAvailableProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'products', 'available', eventId],
        queryFn: () => inventoryService.getAvailableProducts(eventId),
        enabled: !!eventId,
    });
};

export const useLowStockProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'products', 'low-stock', eventId],
        queryFn: () => inventoryService.getLowStockProducts(eventId),
        enabled: !!eventId,
    });
};

export const useEventSupplies = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'supplies', eventId],
        queryFn: () => inventoryService.getEventSupplies(eventId),
        enabled: !!eventId,
    });
};

export const useAvailableSupplies = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'supplies', 'available', eventId],
        queryFn: () => inventoryService.getAvailableSupplies(eventId),
        enabled: !!eventId,
    });
};

export const useLowStockSupplies = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'supplies', 'low-stock', eventId],
        queryFn: () => inventoryService.getLowStockSupplies(eventId),
        enabled: !!eventId,
    });
};

export const useInventoryMutations = (eventId: string) => {
    const queryClient = useQueryClient();

    const loadProducts = useMutation({
        mutationFn: (data: LoadProductsDto) => inventoryService.loadProducts(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'products', eventId] });
        },
    });

    const loadSupplies = useMutation({
        mutationFn: (data: LoadSuppliesDto) => inventoryService.loadSupplies(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'supplies', eventId] });
        },
    });

    return {
        loadProducts,
        loadSupplies,
    };
};
