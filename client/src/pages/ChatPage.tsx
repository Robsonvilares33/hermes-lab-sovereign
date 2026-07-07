import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ChatPage() {
  const handleComingSoon = () => {
    toast.info("Esta funcionalidade estará disponível em breve!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            Chat com Agente Hermes
          </h1>
          <p className="text-slate-400">
            Interface interativa para conversar com o Agente Hermes e realizar análises.
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Interface de Chat</CardTitle>
            <CardDescription>
              Funcionalidade em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <MessageSquare className="w-16 h-16 text-slate-600" />
              <p className="text-slate-400 text-center max-w-md">
                O chat interativo com o Agente Hermes está sendo desenvolvido. 
                Esta funcionalidade permitirá conversas em tempo real com análises profundas.
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
