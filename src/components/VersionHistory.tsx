import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { History, RotateCcw, Clock, User } from 'lucide-react';
import { useVersions } from '@/hooks/useVersions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface VersionHistoryProps {
  tableName: string;
  recordId: string;
  onRestore?: (version: unknown) => void;
}

export const VersionHistory = memo(function VersionHistory({
  tableName,
  recordId,
  onRestore,
}: VersionHistoryProps) {
  const { versions, restoreVersion, isLoading } = useVersions(tableName, recordId);
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const handleRestore = (versionId: string, versionData: unknown) => {
    setRestoring(versionId);
    restoreVersion(versionId);
    onRestore?.(versionData);
    setOpen(false);
    setRestoring(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-1" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de versões
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="space-y-3 p-1">
            <AnimatePresence>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando versões...
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma versão anterior encontrada
                </div>
              ) : (
                versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              v{versions.length - index}
                            </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(version.changed_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                            </div>
                            {version.changed_by && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                {version.changed_by.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                          {index > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(version.id, version.data)}
                              disabled={restoring === version.id}
                            >
                              <RotateCcw className={`h-3 w-3 mr-1 ${restoring === version.id ? 'animate-spin' : ''}`} />
                              Restaurar
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(version.data, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default VersionHistory;
