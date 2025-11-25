"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Calendar, Plus, Copy, Search, Edit, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchEvents, fetchAllProducts, createEvent, updateEvent, duplicateEvent } from "@/lib/api/api"
import type { Event, EventFormData, EventUser, EventPromotion } from "@/lib/types"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function EventosDashboard() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <EventosContent />
    </ProtectedRoute>
  )
}

function EventosContent() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "completed">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: "",
    location: "",
    status: "upcoming",
    description: "",
    availableProducts: [],
    assignedUsers: [],
    promotions: [],
  })

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  })

  const { data: allProducts = [] } = useQuery({
    queryKey: ["allProducts"],
    queryFn: fetchAllProducts,
  })

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      setIsCreateDialogOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      setEditingEvent(null)
      resetForm()
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: duplicateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || event.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [events, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      location: "",
      status: "upcoming",
      description: "",
      availableProducts: [],
      assignedUsers: [],
      promotions: [],
    })
    setEditingEvent(null)
  }

  const handleSubmit = () => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      date: event.date || "",
      location: event.location || "",
      status: event.status || "upcoming",
      description: "",
      availableProducts: [],
      assignedUsers: [],
      promotions: [],
    })
    setIsCreateDialogOpen(true)
  }

  const handleDuplicate = (eventId: string) => {
    duplicateMutation.mutate(eventId)
  }

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      availableProducts: prev.availableProducts?.includes(productId)
        ? prev.availableProducts.filter((id) => id !== productId)
        : [...(prev.availableProducts || []), productId],
    }))
  }

  const addUser = () => {
    setFormData((prev) => ({
      ...prev,
      assignedUsers: [
        ...(prev.assignedUsers || []),
        {
          id: Date.now().toString(),
          name: "",
          role: "cashier",
        },
      ],
    }))
  }

  const updateUser = (index: number, field: keyof EventUser, value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers?.map((user, i) => (i === index ? { ...user, [field]: value } : user)),
    }))
  }

  const removeUser = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers?.filter((_, i) => i !== index),
    }))
  }

  const addPromotion = () => {
    setFormData((prev) => ({
      ...prev,
      promotions: [
        ...(prev.promotions || []),
        {
          id: Date.now().toString(),
          eventId: editingEvent?.id || "",
          name: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          validFrom: "",
          validTo: "",
          isActive: true,
        },
      ],
    }))
  }

  const updatePromotion = (index: number, field: keyof EventPromotion, value: any) => {
    setFormData((prev) => ({
      ...prev,
      promotions: prev.promotions?.map((promo, i) => (i === index ? { ...promo, [field]: value } : promo)),
    }))
  }

  const removePromotion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      promotions: prev.promotions?.filter((_, i) => i !== index),
    }))
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
      default:
        return "bg-white/10 text-white/70 border-white/20"
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "upcoming":
        return "Próximo"
      case "completed":
        return "Completado"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Gestión de Eventos</h1>
            <p className="text-white/60 mt-1">Administra eventos, productos, usuarios y promociones</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1E2C6D] hover:bg-[#1E2C6D]/90 text-white">
                <Plus className="h-4 w-4" />
                Crear Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  {editingEvent
                    ? "Modifica los detalles del evento"
                    : "Configura un nuevo evento con productos, usuarios y promociones"}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/5">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="users">Usuarios</TabsTrigger>
                  <TabsTrigger value="promotions">Promociones</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white">Nombre del Evento</Label>
                    <Input
                      placeholder="Ej: Evento Corporativo - Enero 2025"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Fecha</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Próximo</SelectItem>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Ubicación</Label>
                    <Input
                      placeholder="Ej: Salón de eventos Palermo"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Descripción</Label>
                    <Textarea
                      placeholder="Describe el evento, expectativas, notas especiales..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/20 text-white min-h-[100px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white">Productos Disponibles</Label>
                    <p className="text-sm text-white/60">
                      Selecciona los productos que estarán disponibles en este evento
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto p-2 bg-white/5 rounded-md border border-white/10">
                    {allProducts.map((product) => (
                      <div
                        key={`product-select-${product.id}`}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/5"
                      >

                        <Checkbox
                          id={`product-${product.id}`}
                          checked={formData.availableProducts?.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        <label htmlFor={`product-${product.id}`} className="text-sm text-white cursor-pointer flex-1">
                          {product.name}
                          <span className="text-white/60 ml-2">(${product.price})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Usuarios Asignados</Label>
                      <p className="text-sm text-white/60">Asigna personal para este evento</p>
                    </div>
                    <Button
                      onClick={addUser}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {formData.assignedUsers?.map((user, index) => (
                      <div
                        key={`user-${user.id}`}
                        className="flex gap-2 p-3 bg-white/5 rounded-md border border-white/10"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Nombre"
                            value={user.name}
                            onChange={(e) => updateUser(index, "name", e.target.value)}
                            className="bg-white/5 border-white/20 text-white"
                          />
                          <Select value={user.role} onValueChange={(value) => updateUser(index, "role", value)}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="cashier">Cajero</SelectItem>
                              <SelectItem value="kitchen">Cocina</SelectItem>
                              <SelectItem value="delivery">Entrega</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => removeUser(index)}
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {(!formData.assignedUsers || formData.assignedUsers.length === 0) && (
                      <p className="text-center text-white/40 py-8">No hay usuarios asignados</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="promotions" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Promociones</Label>
                      <p className="text-sm text-white/60">Crea descuentos y ofertas para el evento</p>
                    </div>
                    <Button
                      onClick={addPromotion}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {formData.promotions?.map((promo, index) => (
                      <div
                        key={`promo-${promo.id}`}
                        className="p-3 bg-white/5 rounded-md border border-white/10 space-y-3"
                      >
                        <div className="flex items-start gap-2">
                          <Input
                            placeholder="Nombre de la promoción"
                            value={promo.name}
                            onChange={(e) => updatePromotion(index, "name", e.target.value)}
                            className="bg-white/5 border-white/20 text-white flex-1"
                          />
                          <Button
                            onClick={() => removePromotion(index)}
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Textarea
                          placeholder="Descripción"
                          value={promo.description}
                          onChange={(e) => updatePromotion(index, "description", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={promo.discountType}
                            onValueChange={(value: "percentage" | "fixed") =>
                              updatePromotion(index, "discountType", value)
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Porcentaje</SelectItem>
                              <SelectItem value="fixed">Monto Fijo</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            placeholder="Valor"
                            value={promo.discountValue}
                            onChange={(e) => updatePromotion(index, "discountValue", Number.parseFloat(e.target.value))}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-white/60">Válido desde</Label>
                            <Input
                              type="date"
                              value={promo.validFrom}
                              onChange={(e) => updatePromotion(index, "validFrom", e.target.value)}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-white/60">Válido hasta</Label>
                            <Input
                              type="date"
                              value={promo.validTo}
                              onChange={(e) => updatePromotion(index, "validTo", e.target.value)}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!formData.promotions || formData.promotions.length === 0) && (
                      <p className="text-center text-white/40 py-8">No hay promociones creadas</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
                  className="border-white/20 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.date}
                  className="bg-gradient-blue text-white"
                >
                  <Check className="h-4 w-4" />
                  {editingEvent ? "Guardar Cambios" : "Crear Evento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="upcoming">Próximos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <Card
              key={`event-card-${event.id}`}
              className="bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-lg truncate">{event.name}</CardTitle>
                    <CardDescription className="text-white/60 flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {event.date ? new Date(event.date).toLocaleDateString("es-AR") : "Sin fecha"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(event.status)}>{getStatusLabel(event.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.location && <p className="text-sm text-white/70 line-clamp-2">{event.location}</p>}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(event.id)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3" />
                      Duplicar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-md border-white/20">
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 text-white/40 mx-auto" />
                <p className="text-white/60">No se encontraron eventos</p>
                <p className="text-sm text-white/40">Crea tu primer evento para comenzar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
