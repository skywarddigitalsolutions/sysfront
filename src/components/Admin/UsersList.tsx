import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { fetchUsers } from "@/lib/api/api"
import { User } from "@/lib/types"

export const UsersList = () => {
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
    
  return(
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingUsers ? (
          <p>Cargando usuarios...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de Usuario</TableHead>
                <TableHead>Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}