"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Edit, Trash2, AlertTriangle, Box, Layers, ChevronLeft, ChevronRight, X, Upload } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"

import { useEvents } from "@/features/events/hooks/useEvents"
import { useEventProducts, useEventSupplies, useInventoryMutations } from "@/features/inventory/hooks/useInventory"
import { useSupplies, useSupplyMutations } from "@/features/supplies/hooks/useSupplies"
import { useProducts, useProductMutations } from "@/features/products/hooks/useProducts"
import type { Supply, CreateSupplyDto, UpdateSupplyDto } from "@/features/supplies/types"
import type { Product, CreateProductDto, UpdateProductDto, AssignSuppliesDto } from "@/features/products/types"
import type { LoadProductsDto, LoadSuppliesDto } from "@/features/inventory/types"

export default function InventoryPage() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <InventoryContent />
    </ProtectedRoute>
  )
}

function InventoryContent() {
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("event-products")

  // Pagination
  const [suppliesPage, setSuppliesPage] = useState(1)
  const [productsPage, setProductsPage] = useState(1)
  const itemsPerPage = 10

  // Data hooks
  const { data: events = [] } = useEvents()
  const { data: eventProductInventory = [] } = useEventProducts(selectedEventId)
  const { data: eventSupplyInventory = [] } = useEventSupplies(selectedEventId)
  const { data: allSupplies = [] } = useSupplies()
  const { data: allProducts = [] } = useProducts()

  // Paginated data
  const supplies = allSupplies.slice((suppliesPage - 1) * itemsPerPage, suppliesPage * itemsPerPage)
  const products = allProducts.slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage)
  const suppliesPages = Math.ceil(allSupplies.length / itemsPerPage)
  const productsPages = Math.ceil(allProducts.length / itemsPerPage)

  // Mutations
  const supplyMutations = useSupplyMutations()
  const productMutations = useProductMutations()
  const inventoryMutations = useInventoryMutations(selectedEventId)

  // Supply form
  const [showSupplyDialog, setShowSupplyDialog] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
  const [supplyForm, setSupplyForm] = useState<CreateSupplyDto>({
    name: "",
    unit: "unidades",
    cost: 0,
  })

  // Product form with recipe
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<CreateProductDto>({
    name: "",
    cost: 0,
  })
  const [useRecipe, setUseRecipe] = useState(false)
  const [recipeSupplies, setRecipeSupplies] = useState<Array<{ supplyId: string; qtyPerUnit: number }>>([])

  // Load products to event
  const [showLoadProductsDialog, setShowLoadProductsDialog] = useState(false)
  const [selectedProductsToLoad, setSelectedProductsToLoad] = useState<Array<{
    productId: string
    initialQty: number
    minQty: number
    salePrice: number
    cost?: number
  }>>([])

  // Load supplies to event
  const [showLoadSuppliesDialog, setShowLoadSuppliesDialog] = useState(false)
  const [selectedSuppliesToLoad, setSelectedSuppliesToLoad] = useState<Array<{
    supplyId: string
    initialQty: number
    minQty: number
    cost: number
  }>>([])

  // ... (rest of the file until addSupplyToLoad)



  // Reset pagination when changing tabs
  useEffect(() => {
    setSuppliesPage(1)
    setProductsPage(1)
  }, [activeTab])

  // Supply handlers
  const handleCreateSupply = async () => {
    if (!supplyForm.name) return
    await supplyMutations.createSupply.mutateAsync(supplyForm)
    setShowSupplyDialog(false)
    resetSupplyForm()
  }

  const handleUpdateSupply = async () => {
    if (!editingSupply) return
    await supplyMutations.updateSupply.mutateAsync({
      id: editingSupply.id,
      data: supplyForm as UpdateSupplyDto,
    })
    setShowSupplyDialog(false)
    setEditingSupply(null)
    resetSupplyForm()
  }

  const handleDeleteSupply = async (id: string) => {
    await supplyMutations.deleteSupply.mutateAsync(id)
  }

  const openEditSupply = (supply: Supply) => {
    setEditingSupply(supply)
    setSupplyForm({
      name: supply.name,
      unit: supply.unit,
      cost: supply.cost,
    })
    setShowSupplyDialog(true)
  }

  const resetSupplyForm = () => {
    setSupplyForm({ name: "", unit: "unidades", cost: 0 })
    setEditingSupply(null)
  }

  // Product handlers
  const handleCreateProduct = async () => {
    if (!productForm.name) return

    try {
      const payload = useRecipe
        ? { name: productForm.name }
        : productForm

      const newProduct = await productMutations.createProduct.mutateAsync(payload as CreateProductDto)

      if (useRecipe && recipeSupplies.length > 0 && newProduct) {
        const assignData: AssignSuppliesDto = {
          supplies: recipeSupplies
        }
        await productMutations.assignSupplies.mutateAsync({
          id: newProduct.id,
          data: assignData
        })
      }

      setShowProductDialog(false)
      resetProductForm()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const payload = useRecipe
        ? { name: productForm.name }
        : productForm

      await productMutations.updateProduct.mutateAsync({
        id: editingProduct.id,
        data: payload as UpdateProductDto,
      })

      if (useRecipe && recipeSupplies.length > 0) {
        const assignData: AssignSuppliesDto = {
          supplies: recipeSupplies
        }
        await productMutations.assignSupplies.mutateAsync({
          id: editingProduct.id,
          data: assignData
        })
      }

      setShowProductDialog(false)
      setEditingProduct(null)
      resetProductForm()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    await productMutations.deleteProduct.mutateAsync(id)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      cost: product.cost,
    })

    if (product.supplies?.length) {
      setUseRecipe(true)
      setRecipeSupplies(product.supplies.map(s => ({
        supplyId: s.supplyId,
        qtyPerUnit: s.qtyPerUnit
      })))
    }

    setShowProductDialog(true)
  }

  const resetProductForm = () => {
    setProductForm({ name: "", cost: 0 })
    setEditingProduct(null)
    setUseRecipe(false)
    setRecipeSupplies([])
  }

  const addSupplyToRecipe = () => {
    setRecipeSupplies([...recipeSupplies, { supplyId: "", qtyPerUnit: 1 }])
  }

  const removeSupplyFromRecipe = (index: number) => {
    setRecipeSupplies(recipeSupplies.filter((_, i) => i !== index))
  }

  const updateRecipeSupply = (index: number, field: 'supplyId' | 'qtyPerUnit', value: string | number) => {
    const updated = [...recipeSupplies]
    if (field === 'supplyId') {
      updated[index].supplyId = value as string
    } else {
      updated[index].qtyPerUnit = value as number
    }
    setRecipeSupplies(updated)
  }

  // Load products to event
  const addProductToLoad = () => {
    setSelectedProductsToLoad([
      ...selectedProductsToLoad,
      { productId: "", initialQty: 0, minQty: 0, salePrice: 0 }
    ])
  }

  const removeProductToLoad = (index: number) => {
    setSelectedProductsToLoad(selectedProductsToLoad.filter((_, i) => i !== index))
  }

  const updateProductToLoad = (index: number, field: keyof typeof selectedProductsToLoad[0], value: string | number) => {
    const updated = [...selectedProductsToLoad]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedProductsToLoad(updated)
  }

  const handleLoadProducts = async () => {
    if (!selectedEventId || selectedProductsToLoad.length === 0) return

    try {
      const data: LoadProductsDto = {
        products: selectedProductsToLoad.filter(p => p.productId && p.initialQty > 0)
      }
      await inventoryMutations.loadProducts.mutateAsync(data)
      setShowLoadProductsDialog(false)
      setSelectedProductsToLoad([])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  // Load supplies to event
  // Load supplies to event
  const addSupplyToLoad = () => {
    setSelectedSuppliesToLoad([
      ...selectedSuppliesToLoad,
      { supplyId: "", initialQty: 0, minQty: 0, cost: 0 }
    ])
  }

  const removeSupplyToLoad = (index: number) => {
    setSelectedSuppliesToLoad(selectedSuppliesToLoad.filter((_, i) => i !== index))
  }

  const updateSupplyToLoad = (index: number, field: keyof typeof selectedSuppliesToLoad[0], value: string | number) => {
    const updated = [...selectedSuppliesToLoad]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedSuppliesToLoad(updated)
  }

  const handleLoadSupplies = async () => {
    if (!selectedEventId || selectedSuppliesToLoad.length === 0) return

    try {
      const data: LoadSuppliesDto = {
        supplies: selectedSuppliesToLoad.filter(s => s.supplyId && s.initialQty > 0)
      }
      await inventoryMutations.loadSupplies.mutateAsync(data)
      setShowLoadSuppliesDialog(false)
      setSelectedSuppliesToLoad([])
    } catch (error) {
      console.error('Error loading supplies:', error)
    }
  }

  return (
    <main className="flex-1 p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Gestión de Inventario</h1>
        <p className="text-muted-foreground">
          Administra el inventario por evento y el catálogo de insumos y productos
        </p>
      </div>

      {/* Event Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="event-select" className="text-sm font-medium whitespace-nowrap">
              Seleccionar Evento:
            </Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger id="event-select" className="w-[300px]">
                <SelectValue placeholder="Selecciona un evento..." />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="event-products">
            <Package className="h-4 w-4 mr-2" />
            Inventario Productos
          </TabsTrigger>
          <TabsTrigger value="event-supplies">
            <Box className="h-4 w-4 mr-2" />
            Inventario Insumos
          </TabsTrigger>
          <TabsTrigger value="product-catalog">
            <Layers className="h-4 w-4 mr-2" />
            Catálogo Productos
          </TabsTrigger>
          <TabsTrigger value="supply-catalog">
            <Box className="h-4 w-4 mr-2" />
            Catálogo Insumos
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Event Product Inventory */}
        <TabsContent value="event-products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Inventario de Productos del Evento</h2>
            {selectedEventId && (
              <Button onClick={() => {
                setSelectedProductsToLoad([])
                setShowLoadProductsDialog(true)
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Cargar Productos
              </Button>
            )}
          </div>

          {!selectedEventId ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Selecciona un evento para ver su inventario
              </CardContent>
            </Card>
          ) : eventProductInventory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay productos en el inventario de este evento
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventProductInventory.map((item, index) => (
                <Card key={`${item.id}-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg capitalize">
                        {item.product.name}
                      </CardTitle>
                      {item.hasRecipe && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                          Receta
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">
                        {item.currentQty} / {item.initialQty}
                      </span>
                    </div>
                    {item.currentQty <= item.minQty && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        Stock bajo (min: {item.minQty})
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio venta:</span>
                      <span className="font-medium">${Number(item.salePrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Costo:</span>
                      <span className="font-medium">${Number(item.cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Margen:</span>
                      <span className="font-medium text-green-600">
                        {Number(item.profitMargin || 0).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Event Supply Inventory */}
        <TabsContent value="event-supplies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Inventario de Insumos del Evento</h2>
            {selectedEventId && (
              <Button onClick={() => {
                setSelectedSuppliesToLoad([])
                setShowLoadSuppliesDialog(true)
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Cargar Insumos
              </Button>
            )}
          </div>

          {!selectedEventId ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Selecciona un evento para ver su inventario
              </CardContent>
            </Card>
          ) : eventSupplyInventory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay insumos en el inventario de este evento
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventSupplyInventory.map((item, index) => (
                <Card key={`${item.id}-${index}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">
                      {item.supply.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">
                        {item.currentQty} / {item.initialQty} {item.supply.unit}
                      </span>
                    </div>
                    {item.currentQty <= item.minQty && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        Stock bajo (min: {item.minQty})
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unidad:</span>
                      <span className="font-medium">{item.supply.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Product Catalog */}
        <TabsContent value="product-catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Productos ({allProducts.length})</h2>
            <Button
              onClick={() => {
                resetProductForm()
                setShowProductDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Receta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium capitalize">{product.name}</TableCell>
                      <TableCell>${Number(product.cost || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {product.supplies?.length ? (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                            Sí ({product.supplies.length})
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            title="¿Eliminar producto?"
                            description={`Esto desactivará "${product.name}". Esta acción no se puede deshacer.`}
                            onConfirm={() => handleDeleteProduct(product.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {productsPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                  disabled={productsPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {productsPage} de {productsPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductsPage(p => Math.min(productsPages, p + 1))}
                  disabled={productsPage === productsPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 4: Supply Catalog */}
        <TabsContent value="supply-catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Insumos ({allSupplies.length})</h2>
            <Button
              onClick={() => {
                resetSupplyForm()
                setShowSupplyDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Insumo
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay insumos
                    </TableCell>
                  </TableRow>
                ) : (
                  supplies.map((supply) => (
                    <TableRow key={supply.id}>
                      <TableCell className="font-medium capitalize">{supply.name}</TableCell>
                      <TableCell>{supply.unit}</TableCell>
                      <TableCell>${Number(supply.cost || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={supply.isActive ? "default" : "secondary"}>
                          {supply.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditSupply(supply)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            title="¿Eliminar insumo?"
                            description={`Esto desactivará "${supply.name}". Esta acción no se puede deshacer.`}
                            onConfirm={() => handleDeleteSupply(supply.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {suppliesPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuppliesPage(p => Math.max(1, p - 1))}
                  disabled={suppliesPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {suppliesPage} de {suppliesPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuppliesPage(p => Math.min(suppliesPages, p + 1))}
                  disabled={suppliesPage === suppliesPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supply Dialog */}
      <Dialog open={showSupplyDialog} onOpenChange={setShowSupplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupply ? "Editar Insumo" : "Nuevo Insumo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="supply-name">Nombre</Label>
              <Input
                id="supply-name"
                value={supplyForm.name}
                onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
                placeholder="Ej: Harina"
              />
            </div>
            <div>
              <Label htmlFor="supply-unit">Unidad</Label>
              <Select
                value={supplyForm.unit}
                onValueChange={(value) => setSupplyForm({ ...supplyForm, unit: value })}
              >
                <SelectTrigger id="supply-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidades">Unidades</SelectItem>
                  <SelectItem value="kg">Kilogramos</SelectItem>
                  <SelectItem value="g">Gramos</SelectItem>
                  <SelectItem value="l">Litros</SelectItem>
                  <SelectItem value="ml">Mililitros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supply-cost">Costo</Label>
              <Input
                id="supply-cost"
                type="number"
                step="0.01"
                value={supplyForm.cost}
                onChange={(e) => setSupplyForm({ ...supplyForm, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSupplyDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={editingSupply ? handleUpdateSupply : handleCreateSupply}>
                {editingSupply ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Nombre</Label>
              <Input
                id="product-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Ej: Hamburguesa Completa"
              />
            </div>
            <div>
              <Label htmlFor="product-cost">Costo Base</Label>
              <Input
                id="product-cost"
                type="number"
                step="0.01"
                value={productForm.cost}
                onChange={(e) => setProductForm({ ...productForm, cost: parseFloat(e.target.value) || 0 })}
                disabled={useRecipe}
              />
              {useRecipe && (
                <p className="text-xs text-muted-foreground mt-1">
                  El costo se calculará automáticamente desde la receta
                </p>
              )}
            </div>

            {/* Recipe Section */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-recipe"
                  checked={useRecipe}
                  onCheckedChange={(checked) => setUseRecipe(!!checked)}
                />
                <Label htmlFor="use-recipe" className="cursor-pointer">
                  Este producto tiene receta (asignar insumos)
                </Label>
              </div>

              {useRecipe && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Insumos de la Receta</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSupplyToRecipe}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Insumo
                    </Button>
                  </div>

                  {recipeSupplies.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay insumos asignados. Haz clic en "Agregar Insumo" para empezar.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recipeSupplies.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label className="text-xs">Insumo</Label>
                            <Select
                              value={item.supplyId}
                              onValueChange={(value) => updateRecipeSupply(index, 'supplyId', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Seleccionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {allSupplies.map((supply) => (
                                  <SelectItem key={supply.id} value={supply.id}>
                                    {supply.name} ({supply.unit})
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
                              min="0"
                              value={item.qtyPerUnit}
                              onChange={(e) => updateRecipeSupply(index, 'qtyPerUnit', parseFloat(e.target.value) || 0)}
                              className="h-9"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSupplyFromRecipe(index)}
                            className="h-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                {editingProduct ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Products Dialog */}
      <Dialog open={showLoadProductsDialog} onOpenChange={setShowLoadProductsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar Productos al Inventario del Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Selecciona los productos y configura su inventario inicial
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addProductToLoad}>
                Cancelar
              </Button>
              <Button
                onClick={handleLoadProducts}
                disabled={selectedProductsToLoad.length === 0}
              >
                Cargar {selectedProductsToLoad.length} Producto(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Supplies Dialog */}
      <Dialog open={showLoadSuppliesDialog} onOpenChange={setShowLoadSuppliesDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar Insumos al Inventario del Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Selecciona los insumos y configura su stock inicial
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addSupplyToLoad}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Insumo
              </Button>
            </div>

            {selectedSuppliesToLoad.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay insumos seleccionados
              </p>
            ) : (
              <div className="space-y-3">
                {selectedSuppliesToLoad.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded">
                    <div className="col-span-4">
                      <Label className="text-xs">Insumo</Label>
                      <Select
                        value={item.supplyId}
                        onValueChange={(value) => updateSupplyToLoad(index, 'supplyId', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allSupplies.map((supply) => (
                            <SelectItem key={supply.id} value={supply.id}>
                              {supply.name} ({supply.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Stock Inicial</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.initialQty}
                        onChange={(e) => updateSupplyToLoad(index, 'initialQty', parseInt(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Stock Mínimo</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.minQty}
                        onChange={(e) => updateSupplyToLoad(index, 'minQty', parseInt(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Costo Unitario</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cost}
                        onChange={(e) => updateSupplyToLoad(index, 'cost', parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupplyToLoad(index)}
                        className="h-9"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowLoadSuppliesDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleLoadSupplies}
                disabled={selectedSuppliesToLoad.length === 0}
              >
                Cargar {selectedSuppliesToLoad.length} Insumo(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
