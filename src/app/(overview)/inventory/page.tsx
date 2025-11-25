"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Layers,
  Box,
} from "lucide-react"
import {
  fetchInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/api"
import type { Insumo, Product, InsumoIngredient } from "@/lib/types"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function InventarioDashboard() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'CAJA', 'COCINA']}>
      <InventarioContent />
    </ProtectedRoute>
  )
}

function InventarioContent() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchInsumos, setSearchInsumos] = useState("")
  const [searchProducts, setSearchProducts] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createType, setCreateType] = useState<"insumo" | "producto" | null>(null)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form states para insumo
  const [insumoForm, setInsumoForm] = useState({
    name: "",
    description: "",
    unit: "unidades",
    stock: 0,
    minStock: 0,
    cost: 0,
    supplier: "",
  })

  // Form states para producto
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    minStock: 0,
    category: "",
    ingredients: [] as InsumoIngredient[],
  })

  useEffect(() => {
    loadInsumos()
    loadProducts()
  }, [])

  const loadInsumos = async () => {
    const data = await fetchInsumos()
    setInsumos(data)
  }

  const loadProducts = async () => {
    const data = await fetchAllProducts()
    setProducts(data)
  }

  const handleCreateInsumo = async () => {
    if (!insumoForm.name) return
    await createInsumo(insumoForm)
    setShowCreateDialog(false)
    setCreateType(null)
    resetInsumoForm()
    loadInsumos()
  }

  const handleUpdateInsumo = async () => {
    if (!editingInsumo) return
    await updateInsumo(editingInsumo.id, insumoForm)
    setShowCreateDialog(false)
    setEditingInsumo(null)
    resetInsumoForm()
    loadInsumos()
  }

  const handleDeleteInsumo = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este insumo?")) {
      await deleteInsumo(id)
      loadInsumos()
    }
  }

  const handleCreateProduct = async () => {
    if (!productForm.name || productForm.ingredients.length === 0) return

    // Calcular el costo total del producto basado en los insumos
    const totalCost = productForm.ingredients.reduce((sum, ing) => {
      const insumo = insumos.find((i) => i.id === ing.insumoId)
      return sum + (insumo?.cost || 0) * ing.quantity
    }, 0)

    await createProduct({ ...productForm, cost: totalCost })
    setShowCreateDialog(false)
    setCreateType(null)
    resetProductForm()
    loadProducts()
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    const totalCost = productForm.ingredients.reduce((sum, ing) => {
      const insumo = insumos.find((i) => i.id === ing.insumoId)
      return sum + (insumo?.cost || 0) * ing.quantity
    }, 0)

    await updateProduct(editingProduct.id, { ...productForm, cost: totalCost })
    setShowCreateDialog(false)
    setEditingProduct(null)
    resetProductForm()
    loadProducts()
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
      await deleteProduct(id)
      loadProducts()
    }
  }

  const resetInsumoForm = () => {
    setInsumoForm({
      name: "",
      description: "",
      unit: "unidades",
      stock: 0,
      minStock: 0,
      cost: 0,
      supplier: "",
    })
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      minStock: 0,
      category: "",
      ingredients: [],
    })
  }

  const openEditInsumo = (insumo: Insumo) => {
    setEditingInsumo(insumo)
    setCreateType("insumo")
    setInsumoForm({
      name: insumo.name,
      description: insumo.description || "",
      unit: insumo.unit,
      stock: insumo.stock,
      minStock: insumo.minStock,
      cost: insumo.cost,
      supplier: insumo.supplier || "",
    })
    setShowCreateDialog(true)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setCreateType("producto")
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      minStock: product.minStock || 0,
      category: product.category,
      ingredients: product.ingredients || [],
    })
    setShowCreateDialog(true)
  }

  const addIngredient = () => {
    setProductForm({
      ...productForm,
      ingredients: [...productForm.ingredients, { insumoId: "", insumoName: "", quantity: 1, unit: "" }],
    })
  }

  const updateIngredient = (index: number, field: keyof InsumoIngredient, value: string | number) => {
    const newIngredients = [...productForm.ingredients]

    if (field === "insumoId") {
      const insumo = insumos.find((i) => i.id === value)
      if (insumo) {
        newIngredients[index] = {
          ...newIngredients[index],
          insumoId: insumo.id,
          insumoName: insumo.name,
          unit: insumo.unit,
        }
      }
    } else {
      newIngredients[index] = { ...newIngredients[index], [field]: value }
    }

    setProductForm({ ...productForm, ingredients: newIngredients })
  }

  const removeIngredient = (index: number) => {
    setProductForm({
      ...productForm,
      ingredients: productForm.ingredients.filter((_, i) => i !== index),
    })
  }

  const filteredInsumos = insumos.filter(
    (i) =>
      i.name.toLowerCase().includes(searchInsumos.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchInsumos.toLowerCase()),
  )

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchProducts.toLowerCase()),
  )

  const lowStockInsumos = insumos.filter((i) => i.stock <= i.minStock)
  const lowStockProducts = products.filter((p) => p.minStock && p.stock <= p.minStock)

  const handleOpenCreate = () => {
    setEditingInsumo(null)
    setEditingProduct(null)
    setCreateType(null)
    resetInsumoForm()
    resetProductForm()
    setShowCreateDialog(true)
  }

  return (
    <main className="flex-1 p-6 space-y-8 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            Gestión de Inventario
          </h1>
          <p className="text-muted-foreground">Administra tus insumos y productos terminados</p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="lg"
          className="bg-gradient-to-r from-[#1E2C6D] to-[#1E2C6D]/80 hover:from-[#1E2C6D]/90 hover:to-[#1E2C6D]/70 text-white shadow-lg h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear Nuevo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-black to-gray-700/50 border border-gray-500/30 hover:border-gray-500/50 transition-all shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Insumos</CardTitle>
            <Package className="h-5 w-5 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{insumos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Materias primas</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1E2C6D]/30 to-[#1E2C6D]/10 border border-[#1E2C6D]/50 hover:border-[#1E2C6D]/70 transition-all shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Listos para venta</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 hover:border-orange-500/50 transition-all shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Stock</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{lowStockInsumos.length + lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 hover:border-green-500/50 transition-all shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
            <DollarSign className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              ${insumos.reduce((sum, i) => sum + i.cost * i.stock, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inventario total</p>
          </CardContent>
        </Card>
      </div>

      {(lowStockInsumos.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {lowStockInsumos.length > 0 && (
            <Card className="border border-white/20 bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg text-red-400">Insumos con Stock Bajo</CardTitle>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </CardHeader>
              <CardContent className="space-y-2">
                {lowStockInsumos.map((insumo) => (
                  <div
                    key={insumo.id}
                    className="flex items-center justify-between p-3 bg-gradient-blue rounded-lg border border-red-500/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{insumo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Actual: <span className="text-red-400 font-bold">{insumo.stock}</span> / Mínimo:{" "}
                        <span className="font-bold">{insumo.minStock}</span> {insumo.unit}
                      </p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">¡Bajo!</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card className="border border-white/20 bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg text-yellow-400">Productos con Stock Bajo</CardTitle>
                <TrendingDown className="w-5 h-5 text-yellow-400" />
              </CardHeader>
              <CardContent className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gradient-blue rounded-lg border border-yellow-500/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Actual: <span className="text-yellow-400 font-bold">{product.stock}</span> / Mínimo:{" "}
                        <span className="font-bold">{product.minStock}</span> unidades
                      </p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">¡Bajo!</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          {!createType && !editingInsumo && !editingProduct ? (
            // Pantalla de selección de tipo
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">¿Qué deseas crear?</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-8">
                <Button
                  onClick={() => setCreateType("insumo")}
                  className="h-auto py-12 flex flex-col items-center gap-4 bg-gradient-to-br from-[#1E2C6D] to-[#1E2C6D]/70 hover:from-[#1E2C6D]/90 hover:to-[#1E2C6D]/60 text-white shadow-xl hover:scale-105 transition-all"
                >
                  <Layers className="w-16 h-16" />
                  <div className="text-center">
                    <div className="font-bold text-2xl">Insumo</div>
                    <div className="text-sm opacity-90 mt-2">Materia prima o ingrediente básico</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCreateType("producto")}
                  className="h-auto py-12 flex flex-col items-center gap-4 bg-gradient-to-br from-[#52c78c] to-[#52c78c]/70 hover:from-[#52c78c]/90 hover:to-[#52c78c]/60 text-white shadow-xl hover:scale-105 transition-all"
                >
                  <Box className="w-16 h-16" />
                  <div className="text-center">
                    <div className="font-bold text-2xl">Producto</div>
                    <div className="text-sm opacity-90 mt-2">Item terminado listo para vender</div>
                  </div>
                </Button>
              </div>
            </>
          ) : createType === "insumo" || editingInsumo ? (
            // Formulario de insumo
            <>
              <DialogHeader>
                <DialogTitle>{editingInsumo ? "Editar Insumo" : "Nuevo Insumo"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={insumoForm.name}
                      onChange={(e) => setInsumoForm({ ...insumoForm, name: e.target.value })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Unidad *</Label>
                    <Select value={insumoForm.unit} onValueChange={(v) => setInsumoForm({ ...insumoForm, unit: v })}>
                      <SelectTrigger className="bg-transparent border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/20">
                        <SelectItem value="unidades">Unidades</SelectItem>
                        <SelectItem value="kg">Kilogramos</SelectItem>
                        <SelectItem value="litros">Litros</SelectItem>
                        <SelectItem value="gramos">Gramos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={insumoForm.description}
                    onChange={(e) => setInsumoForm({ ...insumoForm, description: e.target.value })}
                    className="bg-transparent border-white/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Stock Actual *</Label>
                    <Input
                      type="number"
                      value={insumoForm.stock}
                      onChange={(e) => setInsumoForm({ ...insumoForm, stock: Number(e.target.value) })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Stock Mínimo *</Label>
                    <Input
                      type="number"
                      value={insumoForm.minStock}
                      onChange={(e) => setInsumoForm({ ...insumoForm, minStock: Number(e.target.value) })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Costo (por unidad) *</Label>
                    <Input
                      type="number"
                      value={insumoForm.cost}
                      onChange={(e) => setInsumoForm({ ...insumoForm, cost: Number(e.target.value) })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <Label>Proveedor</Label>
                  <Input
                    value={insumoForm.supplier}
                    onChange={(e) => setInsumoForm({ ...insumoForm, supplier: e.target.value })}
                    className="bg-transparent border-white/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false)
                    setEditingInsumo(null)
                    setCreateType(null)
                    resetInsumoForm()
                  }}
                  className="border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingInsumo ? handleUpdateInsumo : handleCreateInsumo}
                  className="bg-[#1E2C6D] hover:bg-[#1E2C6D]/80"
                >
                  {editingInsumo ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </>
          ) : (
            // Formulario de producto
            <>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Categoría *</Label>
                    <Input
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="bg-transparent border-white/20"
                      placeholder="Ej: Comida, Bebida"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="bg-transparent border-white/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Precio de Venta *</Label>
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Stock Inicial *</Label>
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                  <div>
                    <Label>Stock Mínimo</Label>
                    <Input
                      type="number"
                      value={productForm.minStock}
                      onChange={(e) => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                      className="bg-transparent border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Insumos / Ingredientes *</Label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addIngredient}
                      className="bg-[#1E2C6D] hover:bg-[#1E2C6D]/80"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Insumo
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {productForm.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Insumo</Label>
                          <Select
                            value={ingredient.insumoId}
                            onValueChange={(v) => updateIngredient(index, "insumoId", v)}
                          >
                            <SelectTrigger className="bg-transparent border-white/20">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-white/20">
                              {insumos.map((insumo) => (
                                <SelectItem key={insumo.id} value={insumo.id}>
                                  {insumo.name} (${insumo.cost}/{insumo.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32">
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                            className="bg-transparent border-white/20"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeIngredient(index)}
                          className="text-red-400 hover:bg-red-900 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {productForm.ingredients.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-blue rounded-lg border border-white/20">
                      <p className="text-sm text-muted-foreground mb-2">Costo estimado del producto:</p>
                      <p className="text-2xl font-bold text-white">
                        $
                        {productForm.ingredients
                          .reduce((sum, ing) => {
                            const insumo = insumos.find((i) => i.id === ing.insumoId)
                            return sum + (insumo?.cost || 0) * ing.quantity
                          }, 0)
                          .toFixed(2)}
                      </p>
                      {productForm.price > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Margen: $
                          {(
                            productForm.price -
                            productForm.ingredients.reduce((sum, ing) => {
                              const insumo = insumos.find((i) => i.id === ing.insumoId)
                              return sum + (insumo?.cost || 0) * ing.quantity
                            }, 0)
                          ).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false)
                    setEditingProduct(null)
                    setCreateType(null)
                    resetProductForm()
                  }}
                  className="border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  className="bg-gradient-blue"
                >
                  {editingProduct ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* El manejo de tabs se eliminó, ahora se muestran ambas listas y el diálogo es general */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-950" />
            <h2 className="text-2xl font-bold text-foreground">Insumos</h2>
            <Badge className="bg-blue-950 text-white">{insumos.length}</Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar insumos..."
              value={searchInsumos}
              onChange={(e) => setSearchInsumos(e.target.value)}
              className="pl-10 bg-transparent border-white/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsumos.map((insumo) => (
              <Card
                key={insumo.id}
                className="border border-white/20 bg-card hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{insumo.name}</h3>
                      <p className="text-sm text-muted-foreground">{insumo.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditInsumo(insumo)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteInsumo(insumo.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-900 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gradient-blue rounded border border-white/10">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-semibold text-foreground">
                        {insumo.stock} {insumo.unit}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gradient-blue rounded border border-white/10">
                      <span className="text-muted-foreground">Costo unitario:</span>
                      <span className="font-semibold text-green-400">${insumo.cost}</span>
                    </div>
                    {insumo.supplier && (
                      <div className="flex justify-between p-2 bg-gradient-blue rounded border border-white/10">
                        <span className="text-muted-foreground">Proveedor:</span>
                        <span className="text-foreground/80">{insumo.supplier}</span>
                      </div>
                    )}
                  </div>

                  {insumo.stock <= insumo.minStock && (
                    <Badge className="mt-4 w-full justify-center bg-red-500/20 text-red-400 border-red-500/30">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Stock Bajo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-950" />
            <h2 className="text-2xl font-bold text-foreground">Productos</h2>
            <Badge className="bg-blue-950 text-white">{products.length}</Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchProducts}
              onChange={(e) => setSearchProducts(e.target.value)}
              className="pl-10 bg-transparent border-white/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="border border-white/20 bg-card hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <Badge className="bg-[#1E2C6D]/20 text-[#1E2C6D] border-[#1E2C6D]/30">{product.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditProduct(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-900 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-gradient-blue rounded border border-white/10">
                        <span className="text-muted-foreground block text-xs">Precio:</span>
                        <p className="font-semibold text-white">${product.price}</p>
                      </div>
                      <div className="p-2 bg-gradient-blue rounded border border-white/10">
                        <span className="text-muted-foreground block text-xs">Costo:</span>
                        <p className="font-semibold text-foreground">${product.cost}</p>
                      </div>
                      <div className="p-2 bg-gradient-blue rounded border border-white/10">
                        <span className="text-muted-foreground block text-xs">Stock:</span>
                        <p className="font-semibold text-foreground">{product.stock}</p>
                      </div>
                      <div className="p-2 bg-gradient-blue rounded border border-white/10">
                        <span className="text-muted-foreground block text-xs">Margen:</span>
                        <p className="font-semibold text-blue-400">${(product.price - product.cost).toFixed(2)}</p>
                      </div>
                    </div>

                    {product.ingredients && product.ingredients.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs text-muted-foreground mb-2 font-semibold">Ingredientes:</p>
                        <div className="space-y-1">
                          {product.ingredients.map((ing, idx) => (
                            <div key={idx} className="text-xs text-foreground/70 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#1E2C6D]" />
                              {ing.insumoName} ({ing.quantity} {ing.unit})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {product.minStock && product.stock <= product.minStock && (
                    <Badge className="mt-4 w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Stock Bajo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
