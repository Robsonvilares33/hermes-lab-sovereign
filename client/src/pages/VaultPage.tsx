import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Vault, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VaultPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  });

  const documentsQuery = trpc.vault.getDocuments.useQuery({});

  const createMutation = trpc.vault.createDocument.useMutation({
    onSuccess: () => {
      toast.success("Documento criado com sucesso!");
      setFormData({ title: "", content: "", category: "", tags: [] });
      setShowForm(false);
      documentsQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao criar documento");
    },
  });

  const deleteMutation = trpc.vault.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Documento deletado com sucesso!");
      documentsQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao deletar documento");
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      category: formData.category || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este documento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-slate-700 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Vault className="w-8 h-8 text-emerald-400" />
              Vault de Conhecimento
            </h1>
            <p className="text-slate-400">
              Armazene e organize investigações, análises e documentos importantes.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Documento
          </Button>
        </div>

        {/* Formulário de Criação */}
        {showForm && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Título</label>
                <Input
                  placeholder="Título do documento"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Categoria</label>
                <Input
                  placeholder="Ex: Análise, Investigação, Relatório"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Conteúdo</label>
                <Textarea
                  placeholder="Conteúdo do documento"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white min-h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-slate-600"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Digite uma tag e pressione Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar Documento"}
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: "", content: "", category: "", tags: [] });
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

        {/* Lista de Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {documentsQuery.isLoading ? (
            <p className="text-slate-400 col-span-full">Carregando documentos...</p>
          ) : documentsQuery.data && documentsQuery.data.length > 0 ? (
            documentsQuery.data.map((doc: any) => (
              <Card key={doc.id} className="bg-slate-800/50 border-slate-700 hover:border-emerald-500 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{doc.title}</CardTitle>
                      {doc.category && (
                        <CardDescription className="text-emerald-400 mt-1">{doc.category}</CardDescription>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-300 text-sm line-clamp-3">{doc.content}</p>

                  {doc.tags && JSON.parse(doc.tags).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(doc.tags).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-emerald-500 text-emerald-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                    {new Date(doc.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Vault className="w-16 h-16 text-slate-600" />
                <p className="text-slate-400 text-center max-w-md">
                  Nenhum documento no Vault. Crie seu primeiro documento para começar a armazenar conhecimento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
