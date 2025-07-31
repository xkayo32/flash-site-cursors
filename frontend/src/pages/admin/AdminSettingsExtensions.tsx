import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Volume2, Mail, Smartphone, Database, HardDrive, Download, Upload, BarChart3, TrendingUp, Activity, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Componente Toggle
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-accent-500" : "bg-gray-300 dark:bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Seção de Notificações
export const NotificationsSection = () => (
  <motion.div
    key="notifications"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    <div className="space-y-6">
      {/* Configurações de Notificações */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DE NOTIFICAÇÕES</h2>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">NOTIFICAÇÕES POR EMAIL</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enviar notificações importantes por email</p>
                </div>
              </div>
              <Toggle enabled={true} onChange={() => {}} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">NOTIFICAÇÕES PUSH</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notificações no navegador</p>
                </div>
              </div>
              <Toggle enabled={false} onChange={() => {}} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">NOTIFICAÇÕES SMS</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alertas críticos via SMS</p>
                </div>
              </div>
              <Toggle enabled={false} onChange={() => {}} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificações */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">TIPOS DE NOTIFICAÇÕES</h2>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {[
            { name: 'NOVOS USUÁRIOS', desc: 'Notificar quando novos usuários se registram', enabled: true },
            { name: 'FALHAS DE SEGURANÇA', desc: 'Alertas de tentativas de invasão', enabled: true },
            { name: 'BACKUP COMPLETO', desc: 'Confirmação de backups realizados', enabled: true },
            { name: 'ATUALIZAÇÕES SISTEMA', desc: 'Notificações de manutenção', enabled: false },
            { name: 'RELATÓRIOS SEMANAIS', desc: 'Resumo semanal de atividades', enabled: true },
          ].map((notification, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div>
                <h4 className="font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">{notification.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.desc}</p>
              </div>
              <Toggle enabled={notification.enabled} onChange={() => {}} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

// Seção de Backup
export const BackupSection = () => (
  <motion.div
    key="backup"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    <div className="space-y-6">
      {/* Status do Backup */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">STATUS DO BACKUP</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">ATIVO</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sistema de backup operacional</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">2.4GB</p>
                  <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">ÚLTIMO BACKUP</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">HOJE 02:00</p>
                  <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">PRÓXIMO BACKUP</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Backup */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DE BACKUP</h2>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                FREQUÊNCIA DE BACKUP
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all">
                <option>DIÁRIO (Recomendado)</option>
                <option>SEMANAL</option>
                <option>MENSAL</option>
                <option>MANUAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                RETENÇÃO (DIAS)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body uppercase tracking-wider transition-colors">
              <Download className="w-4 h-4" />
              BACKUP MANUAL
            </Button>
            <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 font-police-body uppercase tracking-wider transition-colors">
              <Upload className="w-4 h-4" />
              RESTAURAR BACKUP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Backups */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">HISTÓRICO DE BACKUPS</h2>
        </CardHeader>
        <CardContent className="p-0">
          {[
            { date: '2024-01-31 02:00', size: '2.4GB', status: 'Sucesso', type: 'Automático' },
            { date: '2024-01-30 02:00', size: '2.3GB', status: 'Sucesso', type: 'Automático' },
            { date: '2024-01-29 14:30', size: '2.3GB', status: 'Sucesso', type: 'Manual' },
            { date: '2024-01-29 02:00', size: '2.2GB', status: 'Falhou', type: 'Automático' },
          ].map((backup, index) => (
            <div key={index} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${backup.status === 'Sucesso' ? 'bg-accent-500' : 'bg-gray-400'}`}></div>
                <div>
                  <p className="font-police-body font-medium text-gray-900 dark:text-white">{backup.date}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{backup.type} • {backup.size}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-police-numbers uppercase tracking-wider ${
                backup.status === 'Sucesso' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : 'bg-gray-400 text-white'
              }`}>
                {backup.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

// Seção de Analytics
export const AnalyticsSection = () => (
  <motion.div
    key="analytics"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    <div className="space-y-6">
      {/* Métricas Principais */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">MÉTRICAS PRINCIPAIS</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">1,247</p>
                  <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">USUÁRIOS ATIVOS</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3 text-accent-500" />
                    <span className="text-xs font-police-numbers text-accent-500">+12%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">89.2%</p>
                  <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">UPTIME</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3 text-accent-500" />
                    <span className="text-xs font-police-numbers text-accent-500">+2.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">4,382</p>
                  <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">SESSÕES HOJE</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDown className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-police-numbers text-gray-400">-3%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">R$ 24.8K</p>
                  <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">RECEITA MENSAL</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3 text-accent-500" />
                    <span className="text-xs font-police-numbers text-accent-500">+18%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Analytics */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DE ANALYTICS</h2>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
              <div>
                <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">RASTREAMENTO AVANÇADO</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coleta de dados detalhados de uso</p>
              </div>
              <Toggle enabled={true} onChange={() => {}} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
              <div>
                <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">RELATÓRIOS AUTOMÁTICOS</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Envio automático de relatórios semanais</p>
              </div>
              <Toggle enabled={true} onChange={() => {}} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
              <div>
                <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">ANONIMIZAÇÃO DE DADOS</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Proteger identidade dos usuários</p>
              </div>
              <Toggle enabled={false} onChange={() => {}} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                RETENÇÃO DE DADOS (MESES)
              </label>
              <input
                type="number"
                defaultValue={12}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
              />
            </div>

            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                FREQUÊNCIA DE LIMPEZA
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all">
                <option>SEMANAL</option>
                <option>MENSAL</option>
                <option>TRIMESTRAL</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">RELATÓRIOS DISPONÍVEIS</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'RELATÓRIO DE USUÁRIOS', desc: 'Atividade e engajamento dos usuários', updated: 'Hoje' },
              { name: 'RELATÓRIO DE PERFORMANCE', desc: 'Métricas de sistema e velocidade', updated: 'Ontem' },
              { name: 'RELATÓRIO FINANCEIRO', desc: 'Receitas, assinaturas e pagamentos', updated: 'Hoje' },
              { name: 'RELATÓRIO DE SEGURANÇA', desc: 'Tentativas de invasão e bloqueios', updated: 'Hoje' },
            ].map((report, index) => (
              <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">{report.name}</h4>
                  <Button variant="outline" size="sm" className="gap-2 border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 font-police-numbers text-xs transition-colors">
                    <Download className="w-3 h-3" />
                    BAIXAR
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{report.desc}</p>
                <p className="text-xs font-police-numbers text-gray-500 dark:text-gray-500">Atualizado: {report.updated}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </motion.div>
);