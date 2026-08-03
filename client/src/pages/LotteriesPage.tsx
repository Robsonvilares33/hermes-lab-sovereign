import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type LotteryType = "mega_sena" | "lotomania" | "mais_milionaria";

const lotteryConfig: Record<LotteryType, { name: string; numbers: number; description: string }> = {
  mega_sena: {
    name: "Mega Sena",
    numbers: 60,
    description: "Escolha 6 números de 1 a 60",
  },
  lotomania: {
    name: "Lotomania",
    numbers: 100,
    description: "Escolha 50 números de 1 a 100",
  },
  mais_milionaria: {
    name: "+Milionária",
    numbers: 50,
    description: "Escolha 6 números de 1 a 50",
  },
};

export default function LotteriesPage() {
  const [selectedType, setSelectedType] = useState<LotteryType>("mega_sena");
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [confidence, setConfidence] = useState(75);

  const gamesQuery = trpc.lottery.getGames.useQuery({ type: selectedType });

  const generateMutation = trpc.lottery.generateGame.useMutation({
    onSuccess: (data) => {
      setGeneratedNumbers(data.numbers);
      setConfidence(data.confidence);
      toast.success("Jogo gerado com sucesso!");
      gamesQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao gerar jogo");
    },
  });

  const handleGenerateGame = () => {
    generateMutation.mutate({
      type: selectedType,
      count: 1,
    });
  };

  const config = lotteryConfig[selectedType];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Dices className="w-8 h-8 text-purple-400" />
            Geração de Jogos de Loteria
          </h1>
          <p className="text-slate-400">
            Gere combinações estratégicas para suas loterias favoritas com análise inteligente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seleção de Loteria */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Tipo de Loteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.entries(lotteryConfig) as Array<[LotteryType, typeof lotteryConfig[LotteryType]]>).map(
                  ([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedType === type
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs opacity-75 mt-1">{config.numbers} números</div>
                    </button>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gerador de Jogos */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{config.name}</CardTitle>
                <CardDescription className="text-slate-400">{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Números Gerados */}
                {generatedNumbers.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Números Gerados</h3>
                      <div className="grid grid-cols-6 gap-2">
                        {generatedNumbers.map((num) => (
                          <div
                            key={num}
                            className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-3 text-center font-bold text-lg"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confiança */}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">Nível de Confiança</span>
                        <span className="text-lg font-bold text-purple-400">{confidence}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Gerar */}
                <Button
                  onClick={handleGenerateGame}
                  disabled={generateMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {generateMutation.isPending ? "Gerando..." : "Gerar Novo Jogo"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Histórico de Jogos */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Jogos</CardTitle>
            <CardDescription className="text-slate-400">
              Seus últimos jogos gerados para {config.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gamesQuery.isLoading ? (
              <p className="text-slate-400">Carregando...</p>
            ) : gamesQuery.data && gamesQuery.data.length > 0 ? (
              <div className="space-y-3">
                {gamesQuery.data.map((game: any) => (
                  <div
                    key={game.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        {new Date(game.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {game.confidence && (
                        <span className="text-sm font-medium text-purple-400">{game.confidence}% confiança</span>
                      )}
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {JSON.parse(game.numbers).map((num: number) => (
                        <div key={num} className="bg-slate-800 text-slate-300 rounded px-2 py-1 text-center text-xs">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nenhum jogo gerado ainda. Comece gerando um novo!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
