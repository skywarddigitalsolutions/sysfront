'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventList } from "./admin/event-list"
import { CreateEvent } from "./admin/create-event"
import { CreateMenuItem } from "./admin/create-menu-item"
import { CreateUser } from "./admin/create-user"
import { UsersList } from "./admin/users-list"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="create">Crear</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <EventList />
        </TabsContent>
        <TabsContent value="create">
          <div className="grid md:grid-cols-2 gap-6">
            <CreateEvent />
            <CreateMenuItem />
          </div>
        </TabsContent>
        <TabsContent value="users">
          <CreateUser />
          <UsersList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

