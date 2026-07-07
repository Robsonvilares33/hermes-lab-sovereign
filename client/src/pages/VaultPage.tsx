import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function VaultPage() {
  const handleComingSoon = () => {
    toast.info("Esta funcionalidade estará disponível em breve!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-green-400" />
            Vault de Conhecimento
          </h1>
          <p className="text-slate-400">
            Repositório persistente de investigações, análises e relatórios.
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Vault Obsidian-Style</CardTitle>
            <CardDescription>
              Funcionalidade em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <BookOpen className="w-16 h-16 text-slate-600" />
              <p className="text-slate-400 text-center max-w-md">
                O Vault de conhecimento está sendo desenvolvido. 
                Você poderá armazenar e organizar investigações, análises e documentos.
              </p>
              <Button 
                onClick={handleComingSoon}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Notificar-me quando estiver pronto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
