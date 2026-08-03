import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type LotteryType = "mega_sena" | "lotomania" | "mais_milionaria";

const lotteryConfig: Record<LotteryType, { name: string }> = {
  mega_sena: { name: "Mega Sena" },
  lotomania: { name: "Lotomania" },
  mais_milionaria: { name: "+Milionária" },
};

export default function AnalysisPage() {
  const [selectedType, setSelectedType] = useState<LotteryType>("mega_sena");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    drawNumber: "",
    numbers: "",
    date: new Date().toISOString().split("T")[0],
  });

  const resultsQuery = trpc.results.getResults.useQuery({ type: selectedType });

  const addResultMutation = trpc.results.addResult.useMutation({
    onSuccess: () => {
      toast.success("Resultado adicionado com sucesso!");
      setFormData({
        drawNumber: "",
        numbers: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      resultsQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao adicionar resultado");
    },
  });

  const handleSubmit = () => {
    if (!formData.drawNumber || !formData.numbers) {
      toast.error("Número do sorteio e números são obrigatórios");
      return;
    }

    const numbers = formData.numbers
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      toast.error("Números inválidos");
      return;
    }

    addResultMutation.mutate({
      type: selectedType,
      drawNumber: parseInt(formData.drawNumber),
      numbers,
      date: new Date(formData.date),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-slate-700 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              Resultados de Sorteios
            </h1>
            <p className="text-slate-400">
              Histórico de concursos e análise de padrões.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Resultado
          </Button>
        </div>

        {/* Seleção de Tipo */}
        <div className="flex gap-2">
          {(Object.entries(lotteryConfig) as Array<[LotteryType, typeof lotteryConfig[LotteryType]]>).map(
            ([type, config]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {config.name}
              </button>
            )
          )}
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Adicionar Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Número do Sorteio</label>
                  <Input
                    type="number"
                    placeholder="Ex: 2500"
                    value={formData.drawNumber}
                    onChange={(e) => setFormData({ ...formData, drawNumber: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Data</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Números (separados por vírgula)</label>
                <Input
                  placeholder="Ex: 1, 5, 12, 25, 30, 45"
                  value={formData.numbers}
                  onChange={(e) => setFormData({ ...formData, numbers: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={addResultMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {addResultMutation.isPending ? "Salvando..." : "Salvar Resultado"}
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      drawNumber: "",
                      numbers: "",
                      date: new Date().toISOString().split("T")[0],
                    });
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Resultados */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Concursos</CardTitle>
            <CardDescription className="text-slate-400">
              Últimos resultados de {lotteryConfig[selectedType].name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resultsQuery.isLoading ? (
              <p className="text-slate-400">Carregando resultados...</p>
            ) : resultsQuery.data && resultsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {resultsQuery.data.map((result: any) => (
                  <div
                    key={result.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">Concurso #{result.drawNumber}</h3>
                        <p className="text-xs text-slate-400">
                          {new Date(result.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        {result.type.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-6 gap-2 md:grid-cols-10">
                      {JSON.parse(result.numbers).map((num: number) => (
                        <div
                          key={num}
                          className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded px-2 py-1 text-center font-bold text-sm"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nenhum resultado registrado para {lotteryConfig[selectedType].name}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
