import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Briefcase,
  UserCircle,
  Search,
  Plus,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useBitrix24Status,
  useBitrix24Leads,
  useBitrix24Deals,
  useBitrix24Contacts,
  useCreateBitrix24Lead,
  useCreateBitrix24Deal,
  useCreateBitrix24Contact,
} from "@/hooks/useBitrix24";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// Lead status mapping
const leadStatusMap: Record<string, { label: string; color: string }> = {
  NEW: { label: "Novo", color: "bg-blue-500" },
  IN_PROCESS: { label: "Em Andamento", color: "bg-yellow-500" },
  PROCESSED: { label: "Processado", color: "bg-green-500" },
  CONVERTED: { label: "Convertido", color: "bg-purple-500" },
  JUNK: { label: "Descartado", color: "bg-red-500" },
};

// Deal stage mapping
const dealStageMap: Record<string, { label: string; color: string }> = {
  NEW: { label: "Novo", color: "bg-blue-500" },
  PREPARATION: { label: "Preparação", color: "bg-yellow-500" },
  PREPAYMENT_INVOICE: { label: "Faturamento", color: "bg-orange-500" },
  EXECUTING: { label: "Execução", color: "bg-purple-500" },
  WON: { label: "Ganho", color: "bg-green-500" },
  LOSE: { label: "Perdido", color: "bg-red-500" },
};

type TabType = "leads" | "deals" | "contacts";
type CreateType = "lead" | "deal" | "contact";

const tabToCreateType: Record<TabType, CreateType> = {
  leads: "lead",
  deals: "deal",
  contacts: "contact",
};

function Bitrix24CRMContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<"lead" | "deal" | "contact">("lead");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    lastName: "",
    phone: "",
    email: "",
    opportunity: "",
    comments: "",
  });

  // Queries
  const { data: status } = useBitrix24Status();
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useBitrix24Leads();
  const { data: deals, isLoading: dealsLoading, refetch: refetchDeals } = useBitrix24Deals();
  const { data: contacts, isLoading: contactsLoading, refetch: refetchContacts } = useBitrix24Contacts();

  // Mutations
  const createLead = useCreateBitrix24Lead();
  const createDeal = useCreateBitrix24Deal();
  const createContact = useCreateBitrix24Contact();

  const handleRefresh = () => {
    if (activeTab === "leads") refetchLeads();
    else if (activeTab === "deals") refetchDeals();
    else refetchContacts();
    toast.success("Dados atualizados");
  };

  const openCreateDialog = (type: "lead" | "deal" | "contact") => {
    setCreateType(type);
    setFormData({ title: "", name: "", lastName: "", phone: "", email: "", opportunity: "", comments: "" });
    setShowCreateDialog(true);
  };

  const handleCreate = async () => {
    try {
      if (createType === "lead") {
        await createLead.mutateAsync({
          TITLE: formData.title,
          NAME: formData.name,
          LAST_NAME: formData.lastName,
          PHONE: formData.phone ? [{ VALUE: formData.phone, VALUE_TYPE: "WORK" }] : undefined,
          EMAIL: formData.email ? [{ VALUE: formData.email, VALUE_TYPE: "WORK" }] : undefined,
          OPPORTUNITY: formData.opportunity,
          COMMENTS: formData.comments,
        });
      } else if (createType === "deal") {
        await createDeal.mutateAsync({
          TITLE: formData.title,
          OPPORTUNITY: formData.opportunity,
        });
      } else {
        await createContact.mutateAsync({
          NAME: formData.name,
          LAST_NAME: formData.lastName,
          PHONE: formData.phone ? [{ VALUE: formData.phone, VALUE_TYPE: "WORK" }] : undefined,
          EMAIL: formData.email ? [{ VALUE: formData.email, VALUE_TYPE: "WORK" }] : undefined,
        });
      }
      setShowCreateDialog(false);
      handleRefresh();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatCurrency = (value?: string) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const getPhoneDisplay = (phones?: Array<{ VALUE: string }>) => {
    if (!phones?.length) return null;
    return phones[0].VALUE;
  };

  const getEmailDisplay = (emails?: Array<{ VALUE: string }>) => {
    if (!emails?.length) return null;
    return emails[0].VALUE;
  };

  // Filter data
  const filterData = <T extends { TITLE?: string; NAME?: string; LAST_NAME?: string; STATUS_ID?: string; STAGE_ID?: string }>(
    data: T[] | undefined,
    statusField: "STATUS_ID" | "STAGE_ID"
  ) => {
    if (!data) return [];
    return data.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.TITLE?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.NAME?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.LAST_NAME?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item[statusField] === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  if (!status?.connected) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                <h2 className="text-2xl font-bold mb-2">Bitrix24 Não Conectado</h2>
                <p className="text-muted-foreground mb-6">
                  Configure a integração com o Bitrix24 para acessar o CRM.
                </p>
                <Button onClick={() => navigate("/admin")}>
                  Ir para Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">CRM Bitrix24</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie leads, negócios e contatos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Conectado
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <AllSelectItem label="Todos os Status" />
                  {activeTab === "leads" && (
                    <>
                      <SelectItem value="NEW">Novo</SelectItem>
                      <SelectItem value="IN_PROCESS">Em Andamento</SelectItem>
                      <SelectItem value="PROCESSED">Processado</SelectItem>
                      <SelectItem value="CONVERTED">Convertido</SelectItem>
                    </>
                  )}
                  {activeTab === "deals" && (
                    <>
                      <SelectItem value="NEW">Novo</SelectItem>
                      <SelectItem value="PREPARATION">Preparação</SelectItem>
                      <SelectItem value="EXECUTING">Execução</SelectItem>
                      <SelectItem value="WON">Ganho</SelectItem>
                      <SelectItem value="LOSE">Perdido</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Button onClick={() => openCreateDialog(tabToCreateType[activeTab])}>
                <Plus className="h-4 w-4 mr-2" />
                Novo {activeTab === "leads" ? "Lead" : activeTab === "deals" ? "Negócio" : "Contato"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leads" className="gap-2">
              <UserCircle className="h-4 w-4" />
              Leads
              {leads?.length && <Badge variant="secondary" className="ml-1">{leads.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Negócios
              {deals?.length && <Badge variant="secondary" className="ml-1">{deals.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="h-4 w-4" />
              Contatos
              {contacts?.length && <Badge variant="secondary" className="ml-1">{contacts.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads" className="mt-6">
            {leadsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : leads?.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filterData(leads, "STATUS_ID").map((lead, index) => (
                    <motion.div
                      key={lead.ID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-primary/30 transition-colors group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">
                                {lead.TITLE}
                              </CardTitle>
                              <CardDescription className="truncate">
                                {lead.NAME} {lead.LAST_NAME}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" aria-label="Opções do lead">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir no Bitrix24
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            {lead.STATUS_ID && leadStatusMap[lead.STATUS_ID] && (
                              <Badge className={leadStatusMap[lead.STATUS_ID].color}>
                                {leadStatusMap[lead.STATUS_ID].label}
                              </Badge>
                            )}
                            {lead.OPPORTUNITY && (
                              <span className="text-sm font-medium text-primary">
                                {formatCurrency(lead.OPPORTUNITY)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            {getPhoneDisplay(lead.PHONE) && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{getPhoneDisplay(lead.PHONE)}</span>
                              </div>
                            )}
                            {getEmailDisplay(lead.EMAIL) && (
                              <div className="flex items-center gap-2 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{getEmailDisplay(lead.EMAIL)}</span>
                              </div>
                            )}
                            {lead.DATE_CREATE && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>Criado: {formatDate(lead.DATE_CREATE)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <UserCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">Nenhum lead encontrado</p>
                    <Button onClick={() => refetchLeads()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Carregar Leads
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="mt-6">
            {dealsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : deals?.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filterData(deals, "STAGE_ID").map((deal, index) => (
                    <motion.div
                      key={deal.ID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-primary/30 transition-colors group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base truncate flex-1">
                              {deal.TITLE}
                            </CardTitle>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" aria-label="Opções do negócio">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir no Bitrix24
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            {deal.STAGE_ID && dealStageMap[deal.STAGE_ID] && (
                              <Badge className={dealStageMap[deal.STAGE_ID].color}>
                                {dealStageMap[deal.STAGE_ID].label}
                              </Badge>
                            )}
                            {deal.OPPORTUNITY && (
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(deal.OPPORTUNITY)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            {deal.DATE_CREATE && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>Criado: {formatDate(deal.DATE_CREATE)}</span>
                              </div>
                            )}
                            {deal.CLOSEDATE && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>Fechamento: {formatDate(deal.CLOSEDATE)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">Nenhum negócio encontrado</p>
                    <Button onClick={() => refetchDeals()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Carregar Negócios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6">
            {contactsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : contacts?.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filterData(contacts, "STATUS_ID").map((contact, index) => (
                    <motion.div
                      key={contact.ID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-primary/30 transition-colors group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary">
                                  {contact.NAME?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">
                                  {contact.NAME} {contact.LAST_NAME}
                                </CardTitle>
                                <CardDescription className="truncate">
                                  ID: {contact.ID}
                                </CardDescription>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" aria-label="Opções do contato">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir no Bitrix24
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {getPhoneDisplay(contact.PHONE) && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{getPhoneDisplay(contact.PHONE)}</span>
                              </div>
                            )}
                            {getEmailDisplay(contact.EMAIL) && (
                              <div className="flex items-center gap-2 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{getEmailDisplay(contact.EMAIL)}</span>
                              </div>
                            )}
                            {contact.DATE_CREATE && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>Criado: {formatDate(contact.DATE_CREATE)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">Nenhum contato encontrado</p>
                    <Button onClick={() => refetchContacts()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Carregar Contatos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Novo {createType === "lead" ? "Lead" : createType === "deal" ? "Negócio" : "Contato"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para criar no Bitrix24
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {(createType === "lead" || createType === "deal") && (
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do lead/negócio"
                />
              </div>
            )}

            {(createType === "lead" || createType === "contact") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Sobrenome"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </>
            )}

            {(createType === "lead" || createType === "deal") && (
              <div className="space-y-2">
                <Label htmlFor="opportunity">Valor (R$)</Label>
                <Input
                  id="opportunity"
                  type="number"
                  value={formData.opportunity}
                  onChange={(e) => setFormData({ ...formData, opportunity: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            )}

            {createType === "lead" && (
              <div className="space-y-2">
                <Label htmlFor="comments">Observações</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createLead.isPending ||
                createDeal.isPending ||
                createContact.isPending ||
                (createType !== "contact" && !formData.title) ||
                (createType === "contact" && !formData.name)
              }
            >
              {(createLead.isPending || createDeal.isPending || createContact.isPending) && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Bitrix24CRM() {
  return (
    <ProtectedRoute requiredRole="manager">
      <Bitrix24CRMContent />
    </ProtectedRoute>
  );
}
