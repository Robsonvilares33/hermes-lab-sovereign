import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { Zap, Brain, BarChart3, Lock } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando Hermes Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <Brain className="w-8 h-8 text-blue-400" />
            Hermes Lab
          </div>
          <a href={getLoginUrl()} className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
            Entrar
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Bem-vindo ao <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Hermes Lab</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Um laboratório de inteligência artificial soberana para análise de loterias, geração de estratégias e pesquisa de padrões matemáticos avançados.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href={getLoginUrl()} className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg transition-colors">
                Começar Agora
              </a>
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-slate-600 text-white hover:bg-slate-800 font-medium text-lg transition-colors">
                Saiba Mais
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-20">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition-colors">
              <Brain className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Agente Hermes</h3>
              <p className="text-slate-400">
                Assistente de IA sofisticado com memória persistente, capaz de realizar análises profundas e pesquisa de padrões.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
              <BarChart3 className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Análise de Loterias</h3>
              <p className="text-slate-400">
                Geração e análise de jogos para Mega Sena, Lotomania e +Milionária com estatísticas avançadas.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-green-500/50 transition-colors">
              <Zap className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Operação 24/7</h3>
              <p className="text-slate-400">
                Sistema autônomo funcionando continuamente com notificações automáticas e integração com Telegram.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors">
              <Lock className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Inteligência Soberana</h3>
              <p className="text-slate-400">
                Processamento local com Ollama, garantindo privacidade e controle total dos seus dados.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400">
          <p>© 2026 Hermes Lab. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
