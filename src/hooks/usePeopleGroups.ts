import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { peopleService, groupService, type Person, type Group } from "@/services/peopleService";
import { toast } from "sonner";

export const usePeople = () => {
  const queryClient = useQueryClient();

  const peopleQuery = useQuery({
    queryKey: ['people'],
    queryFn: () => peopleService.getAll(),
  });

  const statsQuery = useQuery({
    queryKey: ['people-stats'],
    queryFn: () => peopleService.getStats(),
  });

  const createMutation = useMutation({
    mutationFn: (person: Omit<Person, 'id' | 'created_at'>) => peopleService.create(person),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['people-stats'] });
      toast.success('Pessoa adicionada e convite enviado!');
    },
    onError: () => {
      toast.error('Erro ao adicionar pessoa');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Person> }) =>
      peopleService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Pessoa atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar pessoa');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Person['status'] }) =>
      peopleService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['people-stats'] });
      toast.success('Status atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => peopleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['people-stats'] });
      toast.success('Pessoa removida!');
    },
    onError: () => {
      toast.error('Erro ao remover pessoa');
    },
  });

  return {
    people: peopleQuery.data || [],
    stats: statsQuery.data || { total: 0, active: 0, invited: 0, inactive: 0, deleted: 0 },
    isLoading: peopleQuery.isLoading,
    createPerson: createMutation.mutate,
    updatePerson: updateMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    deletePerson: deleteMutation.mutate,
    getStatusIcon: peopleService.getStatusIcon,
    getStatusLabel: peopleService.getStatusLabel,
  };
};

export const usePersonDetail = (personId: string) => {
  const queryClient = useQueryClient();

  const personQuery = useQuery({
    queryKey: ['person', personId],
    queryFn: () => peopleService.getById(personId),
    enabled: !!personId,
  });

  return {
    person: personQuery.data,
    isLoading: personQuery.isLoading,
  };
};

export const useGroups = () => {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupService.getAll(),
  });

  const hierarchyQuery = useQuery({
    queryKey: ['groups-hierarchy'],
    queryFn: () => groupService.getHierarchy(),
  });

  const createMutation = useMutation({
    mutationFn: (group: Omit<Group, 'id' | 'created_at' | 'member_count'>) =>
      groupService.create(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo criado!');
    },
    onError: () => {
      toast.error('Erro ao criar grupo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Group> }) =>
      groupService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar grupo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo removido!');
    },
    onError: () => {
      toast.error('Erro ao remover grupo');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, personId, role }: { groupId: string; personId: string; role: 'owner' | 'participant' }) =>
      groupService.addMember(groupId, personId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      toast.success('Membro adicionado!');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, personId }: { groupId: string; personId: string }) =>
      groupService.removeMember(groupId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      toast.success('Membro removido!');
    },
  });

  return {
    groups: groupsQuery.data || [],
    hierarchy: hierarchyQuery.data || [],
    isLoading: groupsQuery.isLoading,
    createGroup: createMutation.mutate,
    updateGroup: updateMutation.mutate,
    deleteGroup: deleteMutation.mutate,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    getTypeIcon: groupService.getTypeIcon,
    getTypeLabel: groupService.getTypeLabel,
  };
};

export const useGroupDetail = (groupId: string) => {
  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupService.getById(groupId),
    enabled: !!groupId,
  });

  const membersQuery = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => groupService.getMembers(groupId),
    enabled: !!groupId,
  });

  return {
    group: groupQuery.data,
    members: membersQuery.data || [],
    isLoading: groupQuery.isLoading,
  };
};
