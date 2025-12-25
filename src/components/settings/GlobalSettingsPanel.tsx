import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, Building2, Globe, Palette, Shield, Database,
  Bell, Clock, Users, Lock, Save, Upload, Download
} from "lucide-react";

interface CompanySettings {
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  language: string;
  fiscal_year_start: string;
  work_start_time: string;
  work_end_time: string;
  work_days: string[];
}

interface SecuritySettings {
  two_factor_required: boolean;
  session_timeout_minutes: number;
  password_min_length: number;
  password_require_special: boolean;
  ip_whitelist_enabled: boolean;
  ip_whitelist: string[];
  sso_enabled: boolean;
  sso_provider?: string;
}

interface PrivacySettings {
  anonymity_threshold: number;
  data_retention_months: number;
  gdpr_enabled: boolean;
  lgpd_enabled: boolean;
  allow_data_export: boolean;
  mask_sensitive_data: boolean;
}

export const GlobalSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'Promo Brindes',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    fiscal_year_start: '01',
    work_start_time: '09:00',
    work_end_time: '18:00',
    work_days: ['seg', 'ter', 'qua', 'qui', 'sex'],
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_required: false,
    session_timeout_minutes: 480,
    password_min_length: 8,
    password_require_special: true,
    ip_whitelist_enabled: false,
    ip_whitelist: [],
    sso_enabled: false,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    anonymity_threshold: 5,
    data_retention_months: 24,
    gdpr_enabled: false,
    lgpd_enabled: true,
    allow_data_export: true,
    mask_sensitive_data: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" /> Configurações Globais
          </h2>
          <p className="text-muted-foreground">Configure o sistema de acordo com sua empresa</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" /> Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Aparência
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Privacidade
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regionalização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={companySettings.timezone}
                    onValueChange={(v) => setCompanySettings({ ...companySettings, timezone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma Padrão</Label>
                  <Select
                    value={companySettings.language}
                    onValueChange={(v) => setCompanySettings({ ...companySettings, language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Início do Ano Fiscal</Label>
                  <Select
                    value={companySettings.fiscal_year_start}
                    onValueChange={(v) => setCompanySettings({ ...companySettings, fiscal_year_start: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">Janeiro</SelectItem>
                      <SelectItem value="04">Abril</SelectItem>
                      <SelectItem value="07">Julho</SelectItem>
                      <SelectItem value="10">Outubro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Trabalho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início do Expediente</Label>
                  <Input
                    type="time"
                    value={companySettings.work_start_time}
                    onChange={(e) => setCompanySettings({ ...companySettings, work_start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim do Expediente</Label>
                  <Input
                    type="time"
                    value={companySettings.work_end_time}
                    onChange={(e) => setCompanySettings({ ...companySettings, work_end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dias de Trabalho</Label>
                <div className="flex gap-2">
                  {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map(day => (
                    <Button
                      key={day}
                      variant={companySettings.work_days.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const days = companySettings.work_days.includes(day)
                          ? companySettings.work_days.filter(d => d !== day)
                          : [...companySettings.work_days, day];
                        setCompanySettings({ ...companySettings, work_days: days });
                      }}
                    >
                      {day.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cores do Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={companySettings.primary_color}
                      onChange={(e) => setCompanySettings({ ...companySettings, primary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={companySettings.primary_color}
                      onChange={(e) => setCompanySettings({ ...companySettings, primary_color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={companySettings.secondary_color}
                      onChange={(e) => setCompanySettings({ ...companySettings, secondary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={companySettings.secondary_color}
                      onChange={(e) => setCompanySettings({ ...companySettings, secondary_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${companySettings.primary_color}, ${companySettings.secondary_color})` }}>
                <p className="text-white font-medium">Preview do Gradiente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores (2FA)</p>
                  <p className="text-sm text-muted-foreground">Exigir 2FA para todos os usuários</p>
                </div>
                <Switch
                  checked={securitySettings.two_factor_required}
                  onCheckedChange={(c) => setSecuritySettings({ ...securitySettings, two_factor_required: c })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SSO (Single Sign-On)</p>
                  <p className="text-sm text-muted-foreground">Login via provedor externo</p>
                </div>
                <Switch
                  checked={securitySettings.sso_enabled}
                  onCheckedChange={(c) => setSecuritySettings({ ...securitySettings, sso_enabled: c })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeout da Sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={securitySettings.session_timeout_minutes}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout_minutes: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho Mínimo da Senha</Label>
                  <Input
                    type="number"
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restrição de IP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Habilitar Whitelist de IP</p>
                  <p className="text-sm text-muted-foreground">Permitir acesso apenas de IPs específicos</p>
                </div>
                <Switch
                  checked={securitySettings.ip_whitelist_enabled}
                  onCheckedChange={(c) => setSecuritySettings({ ...securitySettings, ip_whitelist_enabled: c })}
                />
              </div>
              {securitySettings.ip_whitelist_enabled && (
                <div className="space-y-2">
                  <Label>IPs Permitidos (um por linha)</Label>
                  <Textarea placeholder="192.168.1.1&#10;10.0.0.0/24" rows={4} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proteção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Conformidade LGPD</p>
                  <p className="text-sm text-muted-foreground">Lei Geral de Proteção de Dados (Brasil)</p>
                </div>
                <Switch
                  checked={privacySettings.lgpd_enabled}
                  onCheckedChange={(c) => setPrivacySettings({ ...privacySettings, lgpd_enabled: c })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Conformidade GDPR</p>
                  <p className="text-sm text-muted-foreground">General Data Protection Regulation (EU)</p>
                </div>
                <Switch
                  checked={privacySettings.gdpr_enabled}
                  onCheckedChange={(c) => setPrivacySettings({ ...privacySettings, gdpr_enabled: c })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir Exportação de Dados</p>
                  <p className="text-sm text-muted-foreground">Usuários podem solicitar seus dados</p>
                </div>
                <Switch
                  checked={privacySettings.allow_data_export}
                  onCheckedChange={(c) => setPrivacySettings({ ...privacySettings, allow_data_export: c })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anonimato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Limite Mínimo de Anonimato</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Grupos com menos de N pessoas não exibem dados segmentados
                </p>
                <Input
                  type="number"
                  value={privacySettings.anonymity_threshold}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, anonymity_threshold: parseInt(e.target.value) })}
                  min={3}
                  max={10}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mascarar Dados Sensíveis</p>
                  <p className="text-sm text-muted-foreground">Ocultar CPF, email pessoal em relatórios</p>
                </div>
                <Switch
                  checked={privacySettings.mask_sensitive_data}
                  onCheckedChange={(c) => setPrivacySettings({ ...privacySettings, mask_sensitive_data: c })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Período de Retenção (meses)</Label>
                <Input
                  type="number"
                  value={privacySettings.data_retention_months}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, data_retention_months: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  Dados mais antigos serão arquivados ou removidos automaticamente
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup e Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Último Backup</p>
                  <p className="text-sm text-muted-foreground">{new Date().toLocaleString('pt-BR')}</p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Exportar Dados
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Backup Automático</p>
                  <p className="text-sm text-muted-foreground">Backup diário às 03:00</p>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
