export const formatEventDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
