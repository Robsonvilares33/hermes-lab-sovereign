import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { toast } from "sonner";

export default function ChatPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Queries
  const sessionsQuery = trpc.chat.getSessions.useQuery();
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { sessionId: activeSessionId || 0 },
    { enabled: !!activeSessionId }
  );

  // Mutations
  const createSessionMutation = trpc.chat.createSession.useMutation({
    onSuccess: (data) => {
      toast.success("Nova sessão criada!");
      sessionsQuery.refetch();
      setActiveSessionId(data.sessionId);
    },
    onError: () => {
      toast.error("Erro ao criar sessão");
    },
  });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      // Refresh messages and sessions
      messagesQuery.refetch();
      sessionsQuery.refetch();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem");
    },
  });

  // Update sessions when query changes
  useEffect(() => {
    if (sessionsQuery.data) {
      setSessions(sessionsQuery.data);
      if (!activeSessionId && sessionsQuery.data.length > 0) {
        setActiveSessionId(sessionsQuery.data[0].id);
      }
    }
  }, [sessionsQuery.data, activeSessionId]);

  // Update messages when query changes
  useEffect(() => {
    if (messagesQuery.data) {
      const formattedMessages: Message[] = messagesQuery.data.map((msg: any) => ({
        role: msg.role === "hermes" ? "assistant" : "user",
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [messagesQuery.data]);

  const handleCreateSession = () => {
    const title = `Conversa ${new Date().toLocaleDateString("pt-BR")}`;
    createSessionMutation.mutate({ title });
  };

  const handleSendMessage = (content: string) => {
    if (!activeSessionId) {
      toast.error("Selecione uma sessão");
      return;
    }

    // Add user message to local state
    setMessages((prev) => [...prev, { role: "user", content }]);

    // Send to server
    sendMessageMutation.mutate({
      sessionId: activeSessionId,
      userMessage: content,
    });
  };

  const formatSessionDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com sessões */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base">Sessões</CardTitle>
                  <Button
                    size="sm"
                    onClick={handleCreateSession}
                    disabled={createSessionMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-slate-400 text-sm">Nenhuma sessão. Crie uma!</p>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSessionId === session.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {formatSessionDate(session.updatedAt)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="text-white">
                  {activeSessionId ? "Conversa Ativa" : "Selecione uma sessão"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSessionId ? (
                  <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={sendMessageMutation.isPending}
                    placeholder="Digite sua mensagem para o Agente Hermes..."
                    height={500}
                    emptyStateMessage="Comece uma conversa com o Agente Hermes!"
                    suggestedPrompts={[
                      "Analise padrões da Mega Sena",
                      "Gere números para Lotomania",
                      "Explique probabilidades em loterias",
                    ]}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <MessageSquare className="w-16 h-16 text-slate-600" />
                    <p className="text-slate-400 text-center">
                      Crie uma nova sessão ou selecione uma existente para começar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
