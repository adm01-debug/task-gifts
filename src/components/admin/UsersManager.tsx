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
  Award,
  Flame,
  Coins,
  ChevronLeft,
  ChevronRight,
  Building2,
  Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { type AppRole } from "@/hooks/useRBAC";
import { useDebounce } from "@/hooks/useDebounce";
import { useFuseSearch, SEARCH_PRESETS } from "@/hooks/useFuseSearch";
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
import {
  roleConfig,
  AssignRoleDialog,
  AssignDeptDialog,
  RemoveRoleConfirm,
  BulkAssignRoleDialog,
  BulkAssignDeptDialog,
  BulkRemoveRoleConfirm,
  BulkRemoveDeptsConfirm,
} from "./users";

const ITEMS_PER_PAGE = 10;

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
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
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
  const bulkAssignRole = useBulkAssignRole();
  const bulkRemoveRole = useBulkRemoveRole();
  const bulkAssignDepartment = useBulkAssignDepartment();
  const bulkRemoveFromDepartments = useBulkRemoveFromDepartments();

  // Build user roles map
  const userRolesMap = useMemo(() => {
    const map = new Map<string, AppRole[]>();
    allRoles?.forEach((r) => {
      const existing = map.get(r.user_id) || [];
      existing.push(r.role);
      map.set(r.user_id, existing);
    });
    return map;
  }, [allRoles]);

  // Build user departments map
  const userDeptMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; isManager: boolean }[]>();
    allTeamMembers?.forEach((tm) => {
      const dept = departments?.find((d) => d.id === tm.department_id);
      if (dept) {
        const existing = map.get(tm.user_id) || [];
        existing.push({ id: tm.id, name: dept.name, isManager: tm.is_manager });
        map.set(tm.user_id, existing);
      }
    });
    return map;
  }, [allTeamMembers, departments]);

  const searchResults = useFuseSearch(
    profiles || [],
    ['display_name', 'email'],
    debouncedSearchQuery,
    { ...SEARCH_PRESETS.loose, limit: 100 }
  );

  const filteredUsers = searchResults.map(r => r.item).filter((user) => {
    const userRoles = userRolesMap.get(user.id) || [];
    const matchesRole = filterRole === "all" || userRoles.includes(filterRole as AppRole);
    const userDepts = userDeptMap.get(user.id) || [];
    const matchesDept = filterDepartment === "all" || userDepts.some((d) => d.name === filterDepartment);
    return matchesRole && matchesDept;
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
    } catch {
      toast.error("Erro ao atribuir role");
    }
  }, [roleDialogUser, selectedRole, assignRole]);

  const handleRemoveRole = useCallback(async () => {
    if (!removeRoleConfirm) return;
    try {
      await removeRole.mutateAsync(removeRoleConfirm);
      toast.success("Role removido");
      setRemoveRoleConfirm(null);
    } catch {
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
    } catch {
      toast.error("Erro ao adicionar ao departamento");
    }
  }, [deptDialogUser, selectedDept, assignDepartment]);

  const handleRemoveDepartmentMember = useCallback(async (memberId: string) => {
    setRemovingDeptMemberId(memberId);
    try {
      await removeDepartmentMember.mutateAsync(memberId);
      toast.success("Removido do departamento");
    } catch {
      toast.error("Erro ao remover do departamento");
    } finally {
      setRemovingDeptMemberId(null);
    }
  }, [removeDepartmentMember]);

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
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedUsers.length} selecionado{selectedUsers.length > 1 ? "s" : ""}
                </span>
                <div className="h-4 w-px bg-border" />
                <Button variant="outline" size="sm" onClick={() => setBulkRoleDialog(true)} disabled={bulkAssignRole.isPending}>
                  <Shield className="w-4 h-4 mr-2" />
                  Atribuir Role
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBulkDeptDialog(true)} disabled={bulkAssignDepartment.isPending}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Adicionar a Depto
                </Button>
                <div className="h-4 w-px bg-border" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={bulkRemoveRole.isPending}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Role
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setBulkRemoveRoleConfirm("admin")}>Admin</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkRemoveRoleConfirm("manager")}>Gestor</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkRemoveRoleConfirm("employee")}>Colaborador</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setBulkRemoveDeptsConfirm(true)} disabled={bulkRemoveFromDepartments.isPending}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover de Deptos
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>Limpar seleção</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Users Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => handleSelectUser(user.id)} />
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
                        userRoles.map((role) => (
                          <Badge key={role} className={`text-xs ${roleConfig[role].color}`}>
                            {roleConfig[role].label}
                          </Badge>
                        ))
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
                            {dept.name}{dept.isManager && " 👑"}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Award className="w-3 h-3 text-primary" />Lv.{user.level}</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-amber-500" />{user.streak}</span>
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500" />{user.coins}</span>
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
                          <Shield className="w-4 h-4 mr-2" />Atribuir Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDeptDialogUser(user.id); setSelectedDept(""); }}>
                          <Building2 className="w-4 h-4 mr-2" />Adicionar a Depto
                        </DropdownMenuItem>
                        {userRoles.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Remover Role</DropdownMenuLabel>
                            {userRoles.map((role) => (
                              <DropdownMenuItem key={role} onClick={() => setRemoveRoleConfirm({ userId: user.id, role })} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />{roleConfig[role].label}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        {userDepts.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Remover de Depto</DropdownMenuLabel>
                            {userDepts.map((dept) => (
                              <DropdownMenuItem key={dept.id} onClick={() => handleRemoveDepartmentMember(dept.id)} className="text-destructive" disabled={removingDeptMemberId === dept.id}>
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
          <p className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AssignRoleDialog
        open={!!roleDialogUser}
        onClose={() => setRoleDialogUser(null)}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onAssign={handleAssignRole}
        isPending={assignRole.isPending}
      />

      <AssignDeptDialog
        open={!!deptDialogUser}
        onClose={() => setDeptDialogUser(null)}
        selectedDept={selectedDept}
        onDeptChange={setSelectedDept}
        departments={departments || []}
        onAssign={handleAssignDepartment}
        isPending={assignDepartment.isPending}
      />

      <RemoveRoleConfirm
        open={!!removeRoleConfirm}
        onClose={() => setRemoveRoleConfirm(null)}
        role={removeRoleConfirm?.role || null}
        onConfirm={handleRemoveRole}
      />

      <BulkAssignRoleDialog
        open={bulkRoleDialog}
        onClose={() => setBulkRoleDialog(false)}
        selectedCount={selectedUsers.length}
        role={bulkRole}
        onRoleChange={setBulkRole}
        onAssign={async () => {
          try {
            const result = await bulkAssignRole.mutateAsync({ userIds: selectedUsers, role: bulkRole });
            toast.success(`Role atribuído para ${result.successful} usuário(s)`);
            setBulkRoleDialog(false);
            setSelectedUsers([]);
          } catch { toast.error("Erro ao atribuir roles"); }
        }}
        isPending={bulkAssignRole.isPending}
      />

      <BulkAssignDeptDialog
        open={bulkDeptDialog}
        onClose={() => setBulkDeptDialog(false)}
        selectedCount={selectedUsers.length}
        dept={bulkDept}
        onDeptChange={setBulkDept}
        departments={departments || []}
        onAssign={async () => {
          try {
            const result = await bulkAssignDepartment.mutateAsync({ userIds: selectedUsers, departmentId: bulkDept });
            toast.success(`${result.successful} usuário(s) adicionado(s) ao departamento`);
            setBulkDeptDialog(false);
            setBulkDept("");
            setSelectedUsers([]);
          } catch { toast.error("Erro ao adicionar ao departamento"); }
        }}
        isPending={bulkAssignDepartment.isPending}
      />

      <BulkRemoveRoleConfirm
        open={!!bulkRemoveRoleConfirm}
        onClose={() => setBulkRemoveRoleConfirm(null)}
        role={bulkRemoveRoleConfirm}
        selectedCount={selectedUsers.length}
        onConfirm={async () => {
          if (!bulkRemoveRoleConfirm) return;
          try {
            const result = await bulkRemoveRole.mutateAsync({ userIds: selectedUsers, role: bulkRemoveRoleConfirm });
            toast.success(`Role removido de ${result.successful} usuário(s)`);
            setBulkRemoveRoleConfirm(null);
            setSelectedUsers([]);
          } catch { toast.error("Erro ao remover roles"); }
        }}
      />

      <BulkRemoveDeptsConfirm
        open={bulkRemoveDeptsConfirm}
        onClose={setBulkRemoveDeptsConfirm}
        selectedCount={selectedUsers.length}
        onConfirm={async () => {
          try {
            const result = await bulkRemoveFromDepartments.mutateAsync(selectedUsers);
            toast.success(`${result.successful} usuário(s) removido(s) dos departamentos`);
            setBulkRemoveDeptsConfirm(false);
            setSelectedUsers([]);
          } catch { toast.error("Erro ao remover dos departamentos"); }
        }}
      />
    </div>
  );
}
