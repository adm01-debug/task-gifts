import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  MapPin, 
  Shield, 
  ShieldOff, 
  Clock,
  Search,
  Check,
  X,
  AlertTriangle,
  Settings
} from "lucide-react";
import { useGeoBlocking } from "@/hooks/useGeoBlocking";
import { ALL_COUNTRIES } from "@/services/geoBlockingService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function GeoBlockingManager() {
  const {
    settings,
    countries,
    accessLogs,
    isLoading,
    isLoadingLogs,
    updateSettings,
    addCountry,
    deleteCountry,
    toggleStatus,
    isUpdatingSettings,
    isAddingCountry,
    refetch,
    refetchLogs
  } = useGeoBlocking();

  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [logSearchTerm, setLogSearchTerm] = useState("");

  const existingCodes = countries.map(c => c.country_code);
  const availableCountries = ALL_COUNTRIES.filter(c => !existingCodes.includes(c.code));

  const filteredCountries = countries.filter(country =>
    country.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.country_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = accessLogs.filter(log =>
    log.ip_address.includes(logSearchTerm) ||
    log.country_code?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
    log.country_name?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
    log.reason?.toLowerCase().includes(logSearchTerm.toLowerCase())
  );

  const handleAddCountry = () => {
    const country = ALL_COUNTRIES.find(c => c.code === selectedCountryCode);
    if (country) {
      addCountry({ country_code: country.code, country_name: country.name });
      setSelectedCountryCode("");
      setAddDialogOpen(false);
    }
  };

  const getStatusBadge = (country: typeof countries[0]) => {
    if (country.is_active) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>;
    }
    return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inativo</Badge>;
  };

  const getLogStatusBadge = (wasAllowed: boolean) => {
    if (wasAllowed) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <Check className="h-3 w-3 mr-1" />
          Permitido
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
        <X className="h-3 w-3 mr-1" />
        Bloqueado
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Bloqueio Geográfico</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="geo-enabled" className="text-sm">
                {settings?.is_enabled ? 'Ativo' : 'Desativado'}
              </Label>
              <Switch
                id="geo-enabled"
                checked={settings?.is_enabled || false}
                onCheckedChange={(checked) => updateSettings({ is_enabled: checked })}
                disabled={isUpdatingSettings}
              />
            </div>
          </div>
        </div>
        <CardDescription>
          Whitelist de países permitidos. Apenas IPs de países na lista terão acesso ao sistema.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="countries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="countries" className="gap-2">
              <MapPin className="h-4 w-4" />
              Países ({countries.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Clock className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="countries" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar País
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar País à Whitelist</DialogTitle>
                      <DialogDescription>
                        Selecione um país para permitir acesso ao sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>País</Label>
                        <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um país" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-[300px]">
                              {availableCountries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name} ({country.code})
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleAddCountry} 
                        disabled={!selectedCountryCode || isAddingCountry}
                      >
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {!settings?.is_enabled && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  O bloqueio geográfico está desativado. Todos os países têm acesso.
                </span>
              </div>
            )}

            {filteredCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum país na whitelist</p>
                <p className="text-sm">Adicione países para permitir acesso</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>País</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Adicionado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {country.country_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{country.country_code}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(country)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(country.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleStatus({ id: country.id, isActive: !country.is_active })}
                              title={country.is_active ? "Desativar" : "Ativar"}
                            >
                              {country.is_active ? (
                                <ShieldOff className="h-4 w-4 text-amber-500" />
                              ) : (
                                <Shield className="h-4 w-4 text-emerald-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCountry(country.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por IP, país ou motivo..."
                  value={logSearchTerm}
                  onChange={(e) => setLogSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => refetchLogs()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingLogs ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum log registrado</p>
                <p className="text-sm">Os acessos aparecerão aqui</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{getLogStatusBadge(log.was_allowed)}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                        <TableCell>
                          {log.country_name ? (
                            <div className="flex items-center gap-2">
                              <span>{log.country_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.country_code}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Desconhecido</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.reason || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Bloqueio Geográfico Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Quando ativo, apenas países na whitelist terão acesso
                  </p>
                </div>
                <Switch
                  checked={settings?.is_enabled || false}
                  onCheckedChange={(checked) => updateSettings({ is_enabled: checked })}
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Bloquear Países Desconhecidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloqueia acessos de IPs sem país identificável
                  </p>
                </div>
                <Switch
                  checked={settings?.block_unknown_countries || false}
                  onCheckedChange={(checked) => updateSettings({ block_unknown_countries: checked })}
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Registrar Todos os Acessos</Label>
                  <p className="text-sm text-muted-foreground">
                    Registra tanto acessos permitidos quanto bloqueados
                  </p>
                </div>
                <Switch
                  checked={settings?.log_all_access || false}
                  onCheckedChange={(checked) => updateSettings({ log_all_access: checked })}
                  disabled={isUpdatingSettings}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
