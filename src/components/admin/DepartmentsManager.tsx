import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Crown,
  X,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartments";
import { useProfiles } from "@/hooks/useProfiles";
import { useAllTeamMembers, useAssignDepartment, useRemoveDepartmentMember, useSetDepartmentManager } from "@/hooks/useAdminUsers";
import type { Department } from "@/services/departmentsService";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1",
];

interface DepartmentFormData {
  name: string;
  description: string;
  color: string;
}

const emptyForm: DepartmentFormData = {
  name: "",
  description: "",
  color: "#6366f1",
};

export function DepartmentsManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>(emptyForm);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [addMemberDialog, setAddMemberDialog] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: departments, isLoading } = useDepartments();
  const { data: profiles } = useProfiles();
  const { data: allTeamMembers } = useAllTeamMembers();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const assignDepartment = useAssignDepartment();
  const removeMember = useRemoveDepartmentMember();
  const setManager = useSetDepartmentManager();

  // Build department members map
  const deptMembersMap = new Map<string, Array<{ memberId: string; userId: string; isManager: boolean; profile: any }>>();
  allTeamMembers?.forEach((tm) => {
    const profile = profiles?.find((p) => p.id === tm.user_id);
    const existing = deptMembersMap.get(tm.department_id) || [];
    existing.push({
      memberId: tm.id,
      userId: tm.user_id,
      isManager: tm.is_manager,
      profile,
    });
    deptMembersMap.set(tm.department_id, existing);
  });

  const handleCreate = () => {
    setEditingDept(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || "",
      color: dept.color || "#6366f1",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      if (editingDept) {
        await updateDept.mutateAsync({ id: editingDept.id, updates: formData });
        toast.success("Departamento atualizado");
      } else {
        await createDept.mutateAsync(formData);
        toast.success("Departamento criado");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar departamento");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDept.mutateAsync(deleteConfirm.id);
      toast.success("Departamento excluído");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Erro ao excluir departamento");
    }
  };

  const toggleExpanded = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const handleAddMember = async () => {
    if (!addMemberDialog || !selectedUserId) return;
    try {
      await assignDepartment.mutateAsync({ userId: selectedUserId, departmentId: addMemberDialog });
      toast.success("Membro adicionado");
      setAddMemberDialog(null);
      setSelectedUserId("");
    } catch (error) {
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId);
      toast.success("Membro removido");
    } catch (error) {
      toast.error("Erro ao remover membro");
    }
  };

  const handleToggleManager = async (memberId: string, isCurrentlyManager: boolean) => {
    try {
      await setManager.mutateAsync({ memberId, isManager: !isCurrentlyManager });
      toast.success(isCurrentlyManager ? "Gestor removido" : "Gestor definido");
    } catch (error) {
      toast.error("Erro ao atualizar gestor");
    }
  };

  // Get users not in a specific department
  const getAvailableUsers = (deptId: string) => {
    const deptMembers = deptMembersMap.get(deptId) || [];
    const memberUserIds = new Set(deptMembers.map((m) => m.userId));
    return profiles?.filter((p) => !memberUserIds.has(p.id)) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Departamentos</h2>
          <Badge variant="secondary">{departments?.length || 0}</Badge>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Departamento
        </Button>
      </div>

      {/* Departments List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {departments?.map((dept, index) => {
            const members = deptMembersMap.get(dept.id) || [];
            const managers = members.filter((m) => m.isManager);
            const isExpanded = expandedDepts.has(dept.id);

            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className="border-l-4 overflow-hidden"
                  style={{ borderLeftColor: dept.color || "#6366f1" }}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(dept.id)}>
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${dept.color || "#6366f1"}20` }}
                            >
                              <Building2 className="w-5 h-5" style={{ color: dept.color || "#6366f1" }} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{dept.name}</h3>
                              {dept.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {dept.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{members.length}</span>
                            </div>
                            {managers.length > 0 && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Crown className="w-3 h-3 text-amber-500" />
                                {managers.length} gestor{managers.length > 1 ? "es" : ""}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleEdit(dept); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(dept); }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Membros</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddMemberDialog(dept.id)}
                            className="gap-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            Adicionar
                          </Button>
                        </div>

                        {members.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum membro neste departamento
                          </p>
                        ) : (
                          <div className="grid gap-2">
                            {members.map((member) => (
                              <div
                                key={member.memberId}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {(member.profile?.display_name || member.profile?.email || "U")
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {member.profile?.display_name || "Sem nome"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {member.profile?.email}
                                    </p>
                                  </div>
                                  {member.isManager && (
                                    <Badge className="bg-amber-500/20 text-amber-500 text-xs gap-1">
                                      <Crown className="w-3 h-3" />
                                      Gestor
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleManager(member.memberId, member.isManager)}
                                    title={member.isManager ? "Remover como gestor" : "Definir como gestor"}
                                  >
                                    <Crown
                                      className={`w-4 h-4 ${member.isManager ? "text-amber-500" : "text-muted-foreground"}`}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.memberId)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {departments?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum departamento cadastrado</p>
              <Button onClick={handleCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Criar primeiro departamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Editar Departamento" : "Novo Departamento"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do departamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Comercial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do departamento..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Cor
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createDept.isPending || updateDept.isPending}
            >
              {(createDept.isPending || updateDept.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Departamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o departamento "{deleteConfirm?.name}"?
              Todos os membros serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <Dialog open={!!addMemberDialog} onOpenChange={() => setAddMemberDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription>
              Selecione um usuário para adicionar ao departamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {addMemberDialog &&
                    getAvailableUsers(addMemberDialog).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.display_name || user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!selectedUserId || assignDepartment.isPending}
            >
              {assignDepartment.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
