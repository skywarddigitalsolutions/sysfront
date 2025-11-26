import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/events.api';

export const useActiveEvents = () => {
    return useQuery({
        queryKey: ['events', 'active'],
        queryFn: eventsApi.getActiveEvents,
    });
};

export const useAllEvents = () => {
    return useQuery({
        queryKey: ['events', 'all'],
        queryFn: eventsApi.getAllEvents,
    });
};

export const useEvent = (id: string) => {
    return useQuery({
        queryKey: ['events', id],
        queryFn: () => eventsApi.getEvent(id),
        enabled: !!id,
    });
};
