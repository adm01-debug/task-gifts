import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCog,
  User,
  Mail,
  Calendar,
  Award,
  Flame,
  Coins,
  ChevronLeft,
  ChevronRight,
  Building2,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllSelectItem } from "@/components/ui/all-select-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { type AppRole } from "@/hooks/useRBAC";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  useAllUserRoles, 
  useAssignRole, 
  useRemoveRole,
  useAssignDepartment,
  useRemoveDepartmentMember,
  useAllTeamMembers,
  useBulkAssignRole,
  useBulkRemoveRole,
  useBulkAssignDepartment,
  useBulkRemoveFromDepartments,
} from "@/hooks/useAdminUsers";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const ITEMS_PER_PAGE = 10;

const roleConfig: Record<AppRole, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: "Admin", color: "bg-red-500/20 text-red-500", icon: Shield },
  manager: { label: "Gestor", color: "bg-amber-500/20 text-amber-500", icon: UserCog },
  employee: { label: "Colaborador", color: "bg-blue-500/20 text-blue-500", icon: User },
};

export function UsersManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roleDialogUser, setRoleDialogUser] = useState<string | null>(null);
  const [deptDialogUser, setDeptDialogUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("employee");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [removeRoleConfirm, setRemoveRoleConfirm] = useState<{ userId: string; role: AppRole } | null>(null);
  const [removingDeptMemberId, setRemovingDeptMemberId] = useState<string | null>(null);
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Bulk action states
  const [bulkRoleDialog, setBulkRoleDialog] = useState(false);
  const [bulkDeptDialog, setBulkDeptDialog] = useState(false);
  const [bulkRole, setBulkRole] = useState<AppRole>("employee");
  const [bulkDept, setBulkDept] = useState<string>("");
  const [bulkRemoveRoleConfirm, setBulkRemoveRoleConfirm] = useState<AppRole | null>(null);
  const [bulkRemoveDeptsConfirm, setBulkRemoveDeptsConfirm] = useState(false);

  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: departments } = useDepartments();
  const { data: allRoles } = useAllUserRoles();
  const { data: allTeamMembers } = useAllTeamMembers();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const assignDepartment = useAssignDepartment();
  const removeDepartmentMember = useRemoveDepartmentMember();
  
  // Bulk mutations
  const bulkAssignRole = useBulkAssignRole();
  const bulkRemoveRole = useBulkRemoveRole();
  const bulkAssignDepartment = useBulkAssignDepartment();
  const bulkRemoveFromDepartments = useBulkRemoveFromDepartments();

  // Build user roles map
  const userRolesMap = new Map<string, AppRole[]>();
  allRoles?.forEach((r) => {
    const existing = userRolesMap.get(r.user_id) || [];
    existing.push(r.role);
    userRolesMap.set(r.user_id, existing);
  });

  // Build user departments map
  const userDeptMap = new Map<string, { id: string; name: string; isManager: boolean }[]>();
  allTeamMembers?.forEach((tm) => {
    const dept = departments?.find((d) => d.id === tm.department_id);
    if (dept) {
      const existing = userDeptMap.get(tm.user_id) || [];
      existing.push({ id: tm.id, name: dept.name, isManager: tm.is_manager });
      userDeptMap.set(tm.user_id, existing);
    }
  });

  // Filter and paginate using debounced search
  const filteredUsers = (profiles || []).filter((user) => {
    const matchesSearch =
      user.display_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    const userRoles = userRolesMap.get(user.id) || [];
    const matchesRole = filterRole === "all" || userRoles.includes(filterRole as AppRole);

    const userDepts = userDeptMap.get(user.id) || [];
    const matchesDept =
      filterDepartment === "all" ||
      userDepts.some((d) => d.name === filterDepartment);

    return matchesSearch && matchesRole && matchesDept;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  }, [selectedUsers.length, paginatedUsers]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleAssignRole = useCallback(async () => {
    if (!roleDialogUser) return;
    try {
      await assignRole.mutateAsync({ userId: roleDialogUser, role: selectedRole });
      toast.success(`Role ${roleConfig[selectedRole].label} atribuído`);
      setRoleDialogUser(null);
    } catch (error) {
      toast.error("Erro ao atribuir role");
    }
  }, [roleDialogUser, selectedRole, assignRole]);

  const handleRemoveRole = useCallback(async () => {
    if (!removeRoleConfirm) return;
    try {
      await removeRole.mutateAsync(removeRoleConfirm);
      toast.success("Role removido");
      setRemoveRoleConfirm(null);
    } catch (error) {
      toast.error("Erro ao remover role");
    }
  }, [removeRoleConfirm, removeRole]);

  const handleAssignDepartment = useCallback(async () => {
    if (!deptDialogUser || !selectedDept) return;
    try {
      await assignDepartment.mutateAsync({ userId: deptDialogUser, departmentId: selectedDept });
      toast.success("Usuário adicionado ao departamento");
      setDeptDialogUser(null);
      setSelectedDept("");
    } catch (error) {
      toast.error("Erro ao adicionar ao departamento");
    }
  }, [deptDialogUser, selectedDept, assignDepartment]);

  const handleRemoveDepartmentMember = useCallback(async (memberId: string) => {
    setRemovingDeptMemberId(memberId);
    try {
      await removeDepartmentMember.mutateAsync(memberId);
      toast.success("Removido do departamento");
    } catch (error) {
      toast.error("Erro ao remover do departamento");
    } finally {
      setRemovingDeptMemberId(null);
    }
  }, [removeDepartmentMember]);

  const clearSelection = useCallback(() => setSelectedUsers([]), []);

  if (profilesLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <AllSelectItem label="Todos os Roles" />
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Gestor</SelectItem>
                <SelectItem value="employee">Colaborador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={(v) => { setFilterDepartment(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <AllSelectItem label="Todos os Deptos" />
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="py-2">
              {filteredUsers.length} usuário{filteredUsers.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedUsers.length} selecionado{selectedUsers.length > 1 ? "s" : ""}
                </span>
                
                <div className="h-4 w-px bg-border" />
                
                {/* Bulk Assign Role */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setBulkRoleDialog(true)}
                  disabled={bulkAssignRole.isPending}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Atribuir Role
                </Button>
                
                {/* Bulk Assign Dept */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setBulkDeptDialog(true)}
                  disabled={bulkAssignDepartment.isPending}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Adicionar a Depto
                </Button>
                
                <div className="h-4 w-px bg-border" />
                
                {/* Bulk Remove Role */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      disabled={bulkRemoveRole.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Role
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setBulkRemoveRoleConfirm("admin")}>
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkRemoveRoleConfirm("manager")}>
                      Gestor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkRemoveRoleConfirm("employee")}>
                      Colaborador
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Bulk Remove from Depts */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => setBulkRemoveDeptsConfirm(true)}
                  disabled={bulkRemoveFromDepartments.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover de Deptos
                </Button>
                
                <div className="flex-1" />
                
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                  Limpar seleção
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Users Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-sm font-medium text-muted-foreground">
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </div>
            <div className="col-span-3">Usuário</div>
            <div className="col-span-2">Roles</div>
            <div className="col-span-2">Departamentos</div>
            <div className="col-span-2">Stats</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {/* Table Body */}
          <AnimatePresence mode="popLayout">
            {paginatedUsers.map((user, index) => {
              const userRoles = userRolesMap.get(user.id) || [];
              const userDepts = userDeptMap.get(user.id) || [];
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 hover:bg-muted/20 transition-colors items-center"
                >
                  <div className="col-span-1">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </div>
                  
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.display_name || user.email || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.display_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {userRoles.length === 0 ? (
                        <Badge variant="outline" className="text-xs opacity-50">Nenhum</Badge>
                      ) : (
                        userRoles.map((role) => {
                          const config = roleConfig[role];
                          return (
                            <Badge key={role} className={`text-xs ${config.color}`}>
                              {config.label}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {userDepts.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        userDepts.map((dept) => (
                          <Badge key={dept.id} variant="outline" className="text-xs">
                            {dept.name}
                            {dept.isManager && " 👑"}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-primary" />
                        Lv.{user.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        {user.streak}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-yellow-500" />
                        {user.coins}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Opções do usuário">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Gerenciar</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setRoleDialogUser(user.id); setSelectedRole("employee"); }}>
                          <Shield className="w-4 h-4 mr-2" />
                          Atribuir Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDeptDialogUser(user.id); setSelectedDept(""); }}>
                          <Building2 className="w-4 h-4 mr-2" />
                          Adicionar a Depto
                        </DropdownMenuItem>
                        {userRoles.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Remover Role
                            </DropdownMenuLabel>
                            {userRoles.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => setRemoveRoleConfirm({ userId: user.id, role })}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {roleConfig[role].label}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        {userDepts.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Remover de Depto
                            </DropdownMenuLabel>
                            {userDepts.map((dept) => (
                              <DropdownMenuItem
                                key={dept.id}
                                onClick={() => handleRemoveDepartmentMember(dept.id)}
                                className="text-destructive"
                                disabled={removingDeptMemberId === dept.id}
                              >
                                {removingDeptMemberId === dept.id ? (
                                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                {dept.name}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {paginatedUsers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Assign Role Dialog */}
      <Dialog open={!!roleDialogUser} onOpenChange={() => setRoleDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Role</DialogTitle>
            <DialogDescription>
              Selecione o role a ser atribuído ao usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-amber-500" />
                      Gestor
                    </div>
                  </SelectItem>
                  <SelectItem value="employee">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Colaborador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignRole} disabled={assignRole.isPending}>
              {assignRole.isPending ? "Atribuindo..." : "Atribuir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Department Dialog */}
      <Dialog open={!!deptDialogUser} onOpenChange={() => setDeptDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar a Departamento</DialogTitle>
            <DialogDescription>
              Selecione o departamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptDialogUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignDepartment} disabled={!selectedDept || assignDepartment.isPending}>
              {assignDepartment.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Role Confirmation */}
      <AlertDialog open={!!removeRoleConfirm} onOpenChange={() => setRemoveRoleConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Role</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o role{" "}
              <strong>{removeRoleConfirm?.role && roleConfig[removeRoleConfirm.role].label}</strong>?
              Esta ação pode afetar as permissões do usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRole}
              className="bg-destructive text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Assign Role Dialog */}
      <Dialog open={bulkRoleDialog} onOpenChange={setBulkRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Role em Lote</DialogTitle>
            <DialogDescription>
              Atribuir role para {selectedUsers.length} usuário{selectedUsers.length > 1 ? "s" : ""} selecionado{selectedUsers.length > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-amber-500" />
                      Gestor
                    </div>
                  </SelectItem>
                  <SelectItem value="employee">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Colaborador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRoleDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const result = await bulkAssignRole.mutateAsync({ userIds: selectedUsers, role: bulkRole });
                  toast.success(`Role atribuído para ${result.successful} usuário(s)`);
                  setBulkRoleDialog(false);
                  setSelectedUsers([]);
                } catch (error) {
                  toast.error("Erro ao atribuir roles");
                }
              }} 
              disabled={bulkAssignRole.isPending}
            >
              {bulkAssignRole.isPending ? "Atribuindo..." : `Atribuir para ${selectedUsers.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Department Dialog */}
      <Dialog open={bulkDeptDialog} onOpenChange={setBulkDeptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar a Departamento em Lote</DialogTitle>
            <DialogDescription>
              Adicionar {selectedUsers.length} usuário{selectedUsers.length > 1 ? "s" : ""} ao departamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={bulkDept} onValueChange={setBulkDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeptDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const result = await bulkAssignDepartment.mutateAsync({ userIds: selectedUsers, departmentId: bulkDept });
                  toast.success(`${result.successful} usuário(s) adicionado(s) ao departamento`);
                  setBulkDeptDialog(false);
                  setBulkDept("");
                  setSelectedUsers([]);
                } catch (error) {
                  toast.error("Erro ao adicionar ao departamento");
                }
              }} 
              disabled={!bulkDept || bulkAssignDepartment.isPending}
            >
              {bulkAssignDepartment.isPending ? "Adicionando..." : `Adicionar ${selectedUsers.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Remove Role Confirmation */}
      <AlertDialog open={!!bulkRemoveRoleConfirm} onOpenChange={() => setBulkRemoveRoleConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Role em Lote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o role{" "}
              <strong>{bulkRemoveRoleConfirm && roleConfig[bulkRemoveRoleConfirm].label}</strong>{" "}
              de {selectedUsers.length} usuário{selectedUsers.length > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!bulkRemoveRoleConfirm) return;
                try {
                  const result = await bulkRemoveRole.mutateAsync({ userIds: selectedUsers, role: bulkRemoveRoleConfirm });
                  toast.success(`Role removido de ${result.successful} usuário(s)`);
                  setBulkRemoveRoleConfirm(null);
                  setSelectedUsers([]);
                } catch (error) {
                  toast.error("Erro ao remover roles");
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Remove from Departments Confirmation */}
      <AlertDialog open={bulkRemoveDeptsConfirm} onOpenChange={setBulkRemoveDeptsConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover de Departamentos em Lote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {selectedUsers.length} usuário{selectedUsers.length > 1 ? "s" : ""}{" "}
              de todos os departamentos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  const result = await bulkRemoveFromDepartments.mutateAsync(selectedUsers);
                  toast.success(`${result.successful} usuário(s) removido(s) dos departamentos`);
                  setBulkRemoveDeptsConfirm(false);
                  setSelectedUsers([]);
                } catch (error) {
                  toast.error("Erro ao remover dos departamentos");
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
