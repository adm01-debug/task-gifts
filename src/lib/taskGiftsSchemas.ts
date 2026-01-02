import { z } from 'zod';

export const tarefaSchema = z.object({
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  projeto_id: z.string().uuid().optional(),
  responsavel_id: z.string().uuid().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  status: z.enum(['pendente', 'em_andamento', 'em_revisao', 'concluida', 'cancelada']).default('pendente'),
  data_inicio: z.string().optional(),
  data_vencimento: z.string().optional(),
  estimativa_horas: z.coerce.number().positive().optional(),
});

export const projetoSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  cliente_id: z.string().uuid().optional(),
  responsavel_id: z.string().uuid().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  status: z.enum(['planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado']).default('planejamento'),
  orcamento: z.coerce.number().positive().optional(),
});

export const taskGiftsImportTemplates = {
  tarefas: [
    { key: 'titulo', label: 'Título', example: 'Criar arte final' },
    { key: 'descricao', label: 'Descrição', example: 'Arte para caneca' },
    { key: 'prioridade', label: 'Prioridade', example: 'alta' },
    { key: 'status', label: 'Status', example: 'pendente' },
    { key: 'data_vencimento', label: 'Vencimento', example: '2024-01-20' },
  ],
  projetos: [
    { key: 'nome', label: 'Nome', example: 'Projeto X' },
    { key: 'cliente', label: 'Cliente', example: 'Cliente ABC' },
    { key: 'data_inicio', label: 'Início', example: '2024-01-01' },
    { key: 'data_fim', label: 'Fim', example: '2024-02-01' },
  ],
};

export const taskGiftsFilterConfigs = {
  tarefas: [
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pendente', label: 'Pendente' },
      { value: 'em_andamento', label: 'Em Andamento' },
      { value: 'em_revisao', label: 'Em Revisão' },
      { value: 'concluida', label: 'Concluída' },
    ]},
    { key: 'prioridade', label: 'Prioridade', type: 'select' as const, options: [
      { value: 'baixa', label: 'Baixa' },
      { value: 'media', label: 'Média' },
      { value: 'alta', label: 'Alta' },
      { value: 'urgente', label: 'Urgente' },
    ]},
  ],
};
