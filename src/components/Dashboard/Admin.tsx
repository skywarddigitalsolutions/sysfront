'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventList } from "../Admin/EventList"
import { CreateEvent } from "../Admin/CreateEvent"
import { CreateMenuItem } from "../Admin/CreateMenuItem"
import { CreateUser } from "../Admin/CreateUser"
import { UsersList } from "../Admin/UsersList"

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

