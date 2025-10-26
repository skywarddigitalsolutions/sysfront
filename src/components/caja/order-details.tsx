"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
import { updateOrderStatus, deleteOrder } from "@/lib/api/api";
import { toast } from "@/hooks/use-toast";
import { StatusPill } from "../status-pill";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "../AuthContext";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  console.log("--- user----", user);

  const updateMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", order?.eventId] });
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error al actualizar el estado del pedido:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el estado del pedido.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", order?.eventId] });
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error al eliminar el pedido:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el pedido.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (
    newStatus: "PENDIENTE" | "EN_PREPARACION" | "COMPLETADO"
  ) => {
    if (order) {
      updateMutation.mutate({ orderId: order.id, status: newStatus });
    }
  };

  const handleDelete = () => {
    if (order) {
      deleteMutation.mutate(order.id);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido</DialogTitle>
          <DialogDescription>ID del Pedido: {order.id}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">
              Cliente: {order.customerIdentifier}
            </h4>
            <StatusPill
              status={
                order.status as "PENDIENTE" | "EN_PREPARACION" | "COMPLETADO"
              }
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.menuItem?.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    ${(item.menuItem?.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm font-medium">
            Total: $
            {order.items
              .reduce(
                (total, item) =>
                  total + (item.menuItem?.price || 0) * item.quantity,
                0
              )
              .toFixed(2)}
          </p>
          <div className="mt-6">
            {user?.role !== "CAJA" && (
              <>
                <h5 className="text-sm font-medium mb-2">Cambiar Estado:</h5>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleStatusChange("PENDIENTE")}
                    variant={
                      order.status === "PENDIENTE" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Pendiente
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("EN_PREPARACION")}
                    variant={
                      order.status === "EN_PREPARACION" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    En Preparación
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("COMPLETADO")}
                    variant={
                      order.status === "COMPLETADO" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Completado
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Eliminar Pedido</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente el pedido y toda su información asociada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
