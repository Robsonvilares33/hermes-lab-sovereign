import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Brain, Zap, TrendingUp, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const metrics = [
    {
      title: "Status do Agente",
      value: "Online",
      description: "Hermes está operacional",
      icon: Brain,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
    },
    {
      title: "Análises Realizadas",
      value: "0",
      description: "Nesta sessão",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
    },
    {
      title: "Tempo de Operação",
      value: "24/7",
      description: "Sistema autônomo",
      icon: Clock,
      color: "text-green-400",
      bgColor: "bg-green-900/20",
    },
    {
      title: "Modo Processamento",
      value: "Ollama",
      description: "Inteligência soberana",
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-900/20",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {user?.name || "Robson"}!
          </h1>
          <p className="text-slate-400">
            Seu laboratório de inteligência artificial soberana está pronto para operação.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-300">
                        {metric.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-1">
                        {metric.description}
                      </CardDescription>
                    </div>
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Agente Hermes</CardTitle>
              <CardDescription>
                Assistente de IA sofisticado com memória persistente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  O Agente Hermes é um assistente de inteligência artificial avançado, treinado para realizar análises profundas, pesquisa de padrões e geração de estratégias para análise de loterias.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Persona:</p>
                  <p className="text-sm text-slate-200 font-medium">
                    Pesquisador e Engenheiro de Dados
                  </p>
                </div>
                <a href="/dashboard/chat" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block text-center">
                  Iniciar Chat
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Funcionalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span className="text-sm text-slate-300">Geração de jogos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-sm text-slate-300">Análise estatística</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-sm text-slate-300">Vault de conhecimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span className="text-sm text-slate-300">Notificações Telegram</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Atividade Recente</CardTitle>
            <CardDescription>
              Histórico de operações do laboratório
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                Nenhuma atividade registrada ainda. Comece interagindo com o Agente Hermes!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
