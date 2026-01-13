import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Users, 
  Key, 
  Settings, 
  Plus, 
  Trash2, 
  Search,
  Loader2,
  Check,
  X,
  Crown,
  UserCog,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { rbacService, type Role, type Permission, type UserRole } from "@/services/rbacService";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/hooks/useRBAC";
import { useFuseSearch, SEARCH_PRESETS } from "@/hooks/useFuseSearch";

export function RBACDashboard() {
  const [activeTab, setActiveTab] = useState("roles");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Controle de Acesso (RBAC)</h2>
          <p className="text-muted-foreground">
            Gerencie roles, permissões e acesso de usuários
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Matriz
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesTab searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsTab searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          <PermissionMatrixTab />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserRolesTab searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RolesTab({ searchTerm }: { searchTerm: string }) {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => rbacService.getRoles(),
  });

  // Fuzzy search with Fuse.js
  const searchResults = useFuseSearch(
    roles,
    ['name', 'key'],
    searchTerm,
    { ...SEARCH_PRESETS.commands, limit: 50 }
  );
  const filteredRoles = searchResults.map(r => r.item);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredRoles.map((role) => (
        <Card key={role.id} className="relative">
          {role.is_system && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              Sistema
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              {role.name}
            </CardTitle>
            <CardDescription>{role.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Nível {role.level}</Badge>
                <Badge variant="secondary">{role.key}</Badge>
              </div>
              <RolePermissionsDialog roleId={role.id} roleName={role.name} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RolePermissionsDialog({ roleId, roleName }: { roleId: string; roleName: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: rolePermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["rbac-role-permissions", roleId],
    queryFn: () => rbacService.getRolePermissions(roleId),
    enabled: open,
  });

  const { data: allPermissions = [], isLoading: allPermissionsLoading } = useQuery({
    queryKey: ["rbac-all-permissions"],
    queryFn: () => rbacService.getPermissions(),
    enabled: open,
  });

  const assignMutation = useMutation({
    mutationFn: (permissionId: string) => 
      rbacService.assignPermissionToRole(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-role-permissions", roleId] });
      toast.success("Permissão atribuída!");
    },
    onError: () => toast.error("Erro ao atribuir permissão"),
  });

  const removeMutation = useMutation({
    mutationFn: (permissionId: string) => 
      rbacService.removePermissionFromRole(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-role-permissions", roleId] });
      toast.success("Permissão removida!");
    },
    onError: () => toast.error("Erro ao remover permissão"),
  });

  const permissionIds = new Set(rolePermissions.map(p => p.id));

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Key className="h-4 w-4 mr-1" />
          Permissões
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Permissões de {roleName}</DialogTitle>
          <DialogDescription>
            Gerencie as permissões atribuídas a esta role
          </DialogDescription>
        </DialogHeader>

        {(permissionsLoading || allPermissionsLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-6">
              {Object.entries(permissionsByModule).map(([module, permissions]) => (
                <div key={module}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </h4>
                  <div className="space-y-2">
                    {permissions.map((perm) => {
                      const hasPermission = permissionIds.has(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{perm.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {perm.key}
                            </p>
                          </div>
                          <Switch
                            checked={hasPermission}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                assignMutation.mutate(perm.id);
                              } else {
                                removeMutation.mutate(perm.id);
                              }
                            }}
                            disabled={assignMutation.isPending || removeMutation.isPending}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PermissionsTab({ searchTerm }: { searchTerm: string }) {
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["rbac-all-permissions"],
    queryFn: () => rbacService.getPermissions(),
  });

  // Fuzzy search with Fuse.js
  const searchResults = useFuseSearch(
    permissions,
    ['name', 'key', 'module'],
    searchTerm,
    { ...SEARCH_PRESETS.commands, limit: 100 }
  );
  const filteredPermissions = searchResults.map(r => r.item);

  // Group by module
  const permissionsByModule = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(permissionsByModule).map(([module, perms]) => (
        <Card key={module}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {module.charAt(0).toUpperCase() + module.slice(1)}
            </CardTitle>
            <CardDescription>
              {perms.length} permissão(ões)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Sistema</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perms.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell className="font-medium">{perm.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {perm.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{perm.category || "-"}</Badge>
                    </TableCell>
                    <TableCell>
                      {perm.is_system ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PermissionMatrixTab() {
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => rbacService.getRoles(),
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["rbac-all-permissions"],
    queryFn: () => rbacService.getPermissions(),
  });

  // Fetch permissions for each role
  const rolePermissionsQueries = roles.map(role => ({
    roleId: role.id,
    roleKey: role.key,
  }));

  const { data: allRolePermissions = {}, isLoading: matrixLoading } = useQuery({
    queryKey: ["rbac-permission-matrix", roles.map(r => r.id)],
    queryFn: async () => {
      const matrix: Record<string, Set<string>> = {};
      for (const role of roles) {
        const perms = await rbacService.getRolePermissions(role.id);
        matrix[role.id] = new Set(perms.map(p => p.id));
      }
      return matrix;
    },
    enabled: roles.length > 0,
  });

  const isLoading = rolesLoading || permissionsLoading || matrixLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões</CardTitle>
        <CardDescription>
          Visualize todas as permissões por role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">Permissão</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <Crown className="h-4 w-4" />
                      <span className="text-xs">{role.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(permissionsByModule).map(([module, perms]) => (
                <>
                  <TableRow key={`module-${module}`}>
                    <TableCell 
                      colSpan={roles.length + 1} 
                      className="bg-muted font-semibold"
                    >
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </TableCell>
                  </TableRow>
                  {perms.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell className="sticky left-0 bg-background">
                        <div>
                          <p className="font-medium text-sm">{perm.name}</p>
                          <p className="text-xs text-muted-foreground">{perm.key}</p>
                        </div>
                      </TableCell>
                      {roles.map((role) => {
                        const hasPermission = allRolePermissions[role.id]?.has(perm.id);
                        return (
                          <TableCell key={role.id} className="text-center">
                            {hasPermission ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function UserRolesTab({ searchTerm }: { searchTerm: string }) {
  const queryClient = useQueryClient();

  interface UserWithRoles {
    id: string;
    display_name: string | null;
    email: string | null;
    user_roles: Array<{
      id: string;
      role: AppRole;
      created_at: string;
    }>;
  }

  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithRoles[]>({
    queryKey: ["rbac-users-with-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          email,
          user_roles (
            id,
            role,
            created_at
          )
        `)
        .order("display_name");

      if (error) throw error;
      return (data || []) as unknown as UserWithRoles[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => rbacService.getRoles(),
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) =>
      rbacService.assignRoleToUser(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users-with-roles"] });
      toast.success("Role atribuída!");
    },
    onError: () => toast.error("Erro ao atribuir role"),
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) =>
      rbacService.removeRoleFromUser(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users-with-roles"] });
      toast.success("Role removida!");
    },
    onError: () => toast.error("Erro ao remover role"),
  });

  // Fuzzy search with Fuse.js
  const searchResults = useFuseSearch(
    users,
    ['display_name', 'email'],
    searchTerm,
    { ...SEARCH_PRESETS.loose, limit: 50 }
  );
  const filteredUsers = searchResults.map(r => r.item);

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários e Roles</CardTitle>
        <CardDescription>
          Gerencie as roles atribuídas a cada usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              interface UserRoleItem { role: string }
              const userRoles = user.user_roles?.map((r: UserRoleItem) => r.role) || [];
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      {user.display_name || "Sem nome"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {userRoles.length > 0 ? (
                        userRoles.map((role: string) => (
                          <Badge 
                            key={role} 
                            variant={role === "admin" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => removeMutation.mutate({ 
                              userId: user.id, 
                              role: role as AppRole 
                            })}
                          >
                            {role}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem roles
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      onValueChange={(role) => 
                        assignMutation.mutate({ userId: user.id, role: role as AppRole })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Adicionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(["admin", "manager", "employee"] as AppRole[])
                          .filter(role => !userRoles.includes(role))
                          .map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
