"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Minus, X, Edit2 } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  customizations?: string[] // Items removidos, ej: "Sin queso"
}

interface OrderSheetProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  userId: string
}

export function OrderSheet({ isOpen, onClose, eventId, userId }: OrderSheetProps) {
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [quantity, setQuantity] = useState(1)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null)

  const mockMenuItems = [
    {
      id: "1",
      name: "Hamburguesa",
      price: 15.99,
      customizable: ["Queso", "Lechuga", "Tomate", "Cebolla"],
      suggestions: ["Bebida", "Papas"],
    },
    {
      id: "2",
      name: "Pizza",
      price: 18.99,
      customizable: ["Mozzarella", "Pepperoni", "Champiñones"],
      suggestions: ["Bebida", "Postre"],
    },
    { id: "3", name: "Bebida", price: 3.99, customizable: [], suggestions: [] },
    { id: "4", name: "Postre", price: 8.99, customizable: [], suggestions: [] },
  ]

  const handleAddItem = (item: (typeof mockMenuItems)[0]) => {
    const existingItem = items.find((i) => i.id === item.id)
    if (existingItem) {
      setItems(items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)))
    } else {
      setItems([...items, { ...item, quantity, customizations: [] }])
      setShowSuggestions(item.id)
    }
    setQuantity(1)
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id)
    } else {
      setItems(items.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)))
    }
  }

  const handleToggleCustomization = (itemId: string, customization: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const customizations = item.customizations || []
          const updated = customizations.includes(customization)
            ? customizations.filter((c) => c !== customization)
            : [...customizations, customization]
          return { ...item, customizations: updated }
        }
        return item
      }),
    )
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleConfirm = () => {
    console.log("Pedido creado:", { customerName, items, total, eventId })
    setCustomerName("")
    setItems([])
    setQuantity(1)
    setEditingItemId(null)
    setShowSuggestions(null)
    onClose()
  }

  const getSuggestedItems = (itemId: string) => {
    const item = mockMenuItems.find((m) => m.id === itemId)
    const suggestions = item?.suggestions || []
    return mockMenuItems.filter((m) => suggestions.includes(m.name))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-2 border-white text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/20 pb-4">
          <DialogTitle className="text-2xl font-bold text-white">Nuevo Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-10"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-white/70 mb-2">Selecciona productos:</p>
            <div className="grid grid-cols-2 gap-2">
              {mockMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="p-3 bg-gradient-to-r from-[#1E2C6D] to-[#2a3d8f] hover:from-[#1E2C6D] hover:to-[#1E2C6D] border border-white/20 rounded-lg text-white text-sm font-medium transition-all active:scale-95"
                >
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[#D9251C] text-xs">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Items agregados - Lista simple */}
          {items.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <p className="text-sm font-semibold text-white/70 mb-2">Pedido ({items.length} items):</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => {
                  const menuItem = mockMenuItems.find((m) => m.id === item.id)
                  const isEditing = editingItemId === item.id

                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Item principal */}
                      <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <p className="text-[#D9251C] text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <Minus className="h-3 w-3 text-white" />
                          </button>
                          <span className="w-6 text-center text-white text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <Plus className="h-3 w-3 text-white" />
                          </button>
                          {menuItem?.customizable && menuItem.customizable.length > 0 && (
                            <button
                              onClick={() => setEditingItemId(isEditing ? null : item.id)}
                              className="p-1 hover:bg-[#1E2C6D]/30 rounded ml-1"
                            >
                              <Edit2 className="h-3 w-3 text-[#1E2C6D]" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 hover:bg-[#D9251C]/20 rounded ml-1"
                          >
                            <X className="h-3 w-3 text-[#D9251C]" />
                          </button>
                        </div>
                      </div>

                      {isEditing && menuItem?.customizable && menuItem.customizable.length > 0 && (
                        <div className="bg-[#1E2C6D]/20 border border-[#1E2C6D]/50 rounded p-2 ml-2">
                          <p className="text-xs font-semibold text-[#1E2C6D] mb-1">Personalización:</p>
                          <div className="flex flex-wrap gap-1">
                            {menuItem.customizable.map((custom) => (
                              <button
                                key={custom}
                                onClick={() => handleToggleCustomization(item.id, custom)}
                                className={`text-xs px-2 py-1 rounded transition-all ${
                                  item.customizations?.includes(custom)
                                    ? "bg-[#D9251C] text-white"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                              >
                                {item.customizations?.includes(custom) ? "✓ " : ""}
                                {custom}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {showSuggestions === item.id && getSuggestedItems(item.id).length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded p-2 ml-2">
                          <p className="text-xs font-semibold text-white/70 mb-1">Sugerencias:</p>
                          <div className="flex flex-wrap gap-1">
                            {getSuggestedItems(item.id).map((suggestion) => (
                              <button
                                key={suggestion.id}
                                onClick={() => {
                                  handleAddItem(suggestion)
                                  setShowSuggestions(null)
                                }}
                                className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-all"
                              >
                                + {suggestion.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-white/70 text-xs">Total:</p>
              <p className="text-2xl font-bold text-[#D9251C]">${total.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={items.length === 0 || !customerName}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold h-10"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
