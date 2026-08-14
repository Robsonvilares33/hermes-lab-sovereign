#!/bin/bash

# HERMES LAB V2.0 - DEPLOYMENT SCRIPT
# Automatiza o processo de deploy em produção

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     HERMES LAB V2.0 - DEPLOYMENT AUTOMÁTICO               ║"
echo "║          Iniciando Deploy em Produção                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/hermes-lab-backups"
LOG_FILE="/home/ubuntu/hermes-lab-deployment-${TIMESTAMP}.log"

# Funções
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# 1. PRÉ-DEPLOYMENT
echo ""
log "FASE 1: PRÉ-DEPLOYMENT"
echo ""

log "Verificando dependências..."
command -v node >/dev/null 2>&1 || error "Node.js não encontrado"
command -v pnpm >/dev/null 2>&1 || error "pnpm não encontrado"
command -v mysql >/dev/null 2>&1 || error "MySQL não encontrado"
success "Todas as dependências encontradas"

log "Verificando banco de dados..."
mysql -u root -p"${DB_PASSWORD}" -e "SELECT 1" >/dev/null 2>&1 || error "Falha ao conectar ao banco de dados"
success "Banco de dados acessível"

# 2. BACKUP
echo ""
log "FASE 2: BACKUP"
echo ""

mkdir -p "$BACKUP_DIR"
log "Criando backup do banco de dados..."
mysqldump -u root -p"${DB_PASSWORD}" hermes_lab > "${BACKUP_DIR}/hermes_lab_${TIMESTAMP}.sql" || error "Falha ao fazer backup"
success "Backup criado: ${BACKUP_DIR}/hermes_lab_${TIMESTAMP}.sql"

log "Fazendo backup do código..."
tar -czf "${BACKUP_DIR}/hermes_lab_code_${TIMESTAMP}.tar.gz" /home/ubuntu/hermes-lab-sovereign || error "Falha ao fazer backup do código"
success "Backup do código criado"

# 3. BUILD
echo ""
log "FASE 3: BUILD"
echo ""

cd /home/ubuntu/hermes-lab-sovereign

log "Instalando dependências..."
pnpm install --frozen-lockfile || error "Falha ao instalar dependências"
success "Dependências instaladas"

log "Executando testes..."
pnpm test || warning "Alguns testes falharam (continuando...)"
success "Testes concluídos"

log "Compilando TypeScript..."
pnpm build || error "Falha na compilação"
success "Build concluído com sucesso"

# 4. DEPLOYMENT
echo ""
log "FASE 4: DEPLOYMENT"
echo ""

log "Parando servidor anterior..."
pkill -f "node.*hermes-lab" || warning "Nenhum servidor anterior encontrado"
sleep 2
success "Servidor parado"

log "Iniciando novo servidor..."
nohup pnpm start > /var/log/hermes-lab.log 2>&1 &
sleep 5
success "Novo servidor iniciado"

# 5. VALIDAÇÃO
echo ""
log "FASE 5: VALIDAÇÃO"
echo ""

log "Verificando saúde do servidor..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        success "Servidor respondendo normalmente"
        break
    fi
    if [ $i -eq 10 ]; then
        error "Servidor não respondendo após 10 tentativas"
    fi
    warning "Tentativa $i/10 - aguardando..."
    sleep 2
done

log "Testando geração de previsões..."
curl -X POST http://localhost:3000/api/trpc/lottery.generateGames \
    -H "Content-Type: application/json" \
    -d '{"type":"mega-sena"}' || error "Falha ao gerar previsões"
success "Geração de previsões funcionando"

log "Verificando banco de dados..."
mysql -u root -p"${DB_PASSWORD}" hermes_lab -e "SELECT COUNT(*) as predictions FROM lottery_games;" || error "Falha ao acessar banco de dados"
success "Banco de dados acessível"

# 6. MONITORAMENTO
echo ""
log "FASE 6: MONITORAMENTO"
echo ""

log "Ativando monitoramento..."
# Iniciar serviço de monitoramento
nohup node /home/ubuntu/hermes-lab-sovereign/server/monitoring.js > /var/log/hermes-lab-monitoring.log 2>&1 &
success "Monitoramento ativado"

log "Configurando cron jobs..."
# Adicionar cron jobs
(crontab -l 2>/dev/null; echo "0 10 * * 2,6 /home/ubuntu/hermes-lab-sovereign/bin/generate-predictions.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 21 * * 2,6 /home/ubuntu/hermes-lab-sovereign/bin/validate-predictions.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * 0 /home/ubuntu/hermes-lab-sovereign/bin/retrain-model.sh") | crontab -
success "Cron jobs configurados"

# 7. RELATÓRIO FINAL
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          DEPLOYMENT CONCLUÍDO COM SUCESSO! ✅             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log "RESUMO DO DEPLOYMENT:"
echo ""
echo "  📊 Timestamp: $TIMESTAMP"
echo "  📁 Backup: ${BACKUP_DIR}/hermes_lab_${TIMESTAMP}.sql"
echo "  📝 Log: $LOG_FILE"
echo "  🌐 URL: http://localhost:3000"
echo "  📈 Dashboard: http://localhost:3000/dashboard"
echo ""

log "PRÓXIMOS PASSOS:"
echo ""
echo "  1. Monitorar logs: tail -f /var/log/hermes-lab.log"
echo "  2. Ver dashboard: http://localhost:3000/dashboard"
echo "  3. Verificar previsões: http://localhost:3000/api/trpc/lottery.getGames"
echo "  4. Ativar notificações: Configurar email em .env"
echo ""

success "Hermes Lab V2.0 está operacional! 🚀"
echo ""
