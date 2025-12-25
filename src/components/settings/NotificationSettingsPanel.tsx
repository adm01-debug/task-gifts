import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { Bell, Mail, Smartphone, Moon, Clock, FileText } from "lucide-react";

export const NotificationSettingsPanel = () => {
  const { templates, preferences, isLoading, updatePreference, setQuietHours, getPreference } = useNotificationTemplates();
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const handleToggleChannel = (templateKey: string, channel: 'email' | 'push' | 'in_app', enabled: boolean) => {
    const updates = { [`${channel}_enabled`]: enabled };
    updatePreference({ notificationType: templateKey, updates });
  };

  const handleSaveQuietHours = () => {
    setQuietHours({ start: quietStart, end: quietEnd });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'in_app': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences"><Bell className="h-4 w-4 mr-2" />Preferências</TabsTrigger>
          <TabsTrigger value="quiet"><Moon className="h-4 w-4 mr-2" />Horário de Silêncio</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          {Object.entries(groupedTemplates).map(([category, temps]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {temps.map(template => {
                  const pref = getPreference(template.key);
                  return (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {template.channels.includes('email') && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Switch checked={pref?.email_enabled !== false} onCheckedChange={(checked) => handleToggleChannel(template.key, 'email', checked)} />
                          </div>
                        )}
                        {template.channels.includes('push') && (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <Switch checked={pref?.push_enabled !== false} onCheckedChange={(checked) => handleToggleChannel(template.key, 'push', checked)} />
                          </div>
                        )}
                        {template.channels.includes('in_app') && (
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <Switch checked={pref?.in_app_enabled !== false} onCheckedChange={(checked) => handleToggleChannel(template.key, 'in_app', checked)} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quiet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Horário de Silêncio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Configure um período onde você não deseja receber notificações push.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Início</Label>
                  <Input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSaveQuietHours}>Salvar Horário de Silêncio</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.map(template => (
            <Card key={template.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{template.key}</Badge>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {template.channels.map(channel => (
                      <Badge key={channel} variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(channel)}
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-mono">{template.body_template}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
