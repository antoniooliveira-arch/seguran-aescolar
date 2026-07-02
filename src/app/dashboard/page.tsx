'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, Clock, CheckCircle2, Users, School as SchoolIcon, 
  Plus, FileText, LogOut, Menu, X, BarChart3, Shield 
} from 'lucide-react';
import Link from 'next/link';
import { Call, User } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));

    // Mock data for demo
    const mockCalls: Call[] = [
      {
        id: 1,
        number: "NISE-250001",
        date: new Date(2025, 0, 15, 8, 30),
        schoolId: 1,
        school: { id: 1, name: "CEI Luiz Felipe", type: "CEI" },
        requester: "Maria Oliveira",
        phone: "(11) 94567-1122",
        type: "Vandalismo",
        priority: "Alta",
        description: "Pichação nas paredes externas e quebra de 3 vidros.",
        team: "Equipe Tática Alpha",
        status: "Em atendimento",
        responsible: "Supervisor Tático",
        createdAt: new Date(2025, 0, 15, 8, 30),
        updatedAt: new Date(2025, 0, 15, 8, 30),
      },
      {
        id: 2,
        number: "NISE-250002",
        date: new Date(2025, 0, 16, 14, 15),
        schoolId: 5,
        school: { id: 5, name: "CEM São Cristóvão", type: "CEM" },
        requester: "Prof. Carlos Mendes",
        phone: "(11) 99876-5544",
        type: "Invasão",
        priority: "Urgente",
        description: "Pessoa não autorizada foi vista dentro do pátio após o horário de aula.",
        team: "Equipe Bravo",
        status: "Aberto",
        createdAt: new Date(2025, 0, 16, 14, 15),
        updatedAt: new Date(2025, 0, 16, 14, 15),
      },
      {
        id: 3,
        number: "NISE-250003",
        date: new Date(2025, 0, 17, 9, 45),
        schoolId: 12,
        school: { id: 12, name: "EM Paulo Freire", type: "EM" },
        requester: "Diretora Ana Paula",
        phone: "(11) 97788-2233",
        type: "Furto",
        priority: "Média",
        description: "Roubados 2 notebooks da sala de informática durante o final de semana.",
        team: "Equipe Tática Alpha",
        status: "Concluído",
        closingDate: new Date(2025, 0, 18, 11, 0),
        closingResponsible: "Admin SME",
        opinion: "Equipe realizou perícia. Boletim de ocorrência registrado. Câmeras serão instaladas.",
        createdAt: new Date(2025, 0, 17, 9, 45),
        updatedAt: new Date(2025, 0, 18, 11, 0),
      }
    ];
    
    setCalls(mockCalls);
  }, []);

  const filteredCalls = calls.filter(call => {
    if (filter === 'all') return true;
    if (filter === 'open') return ['Aberto', 'Em análise', 'Encaminhado'].includes(call.status);
    if (filter === 'inprogress') return ['Em atendimento', 'Aguardando parecer'].includes(call.status);
    if (filter === 'closed') return call.status === 'Concluído';
    return true;
  });

  const stats = {
    total: calls.length,
    open: calls.filter(c => ['Aberto', 'Em análise', 'Encaminhado', 'Em atendimento', 'Aguardando parecer'].includes(c.status)).length,
    inProgress: calls.filter(c => ['Em atendimento', 'Aguardando parecer'].includes(c.status)).length,
    closed: calls.filter(c => c.status === 'Concluído').length,
    urgent: calls.filter(c => c.priority === 'Urgente').length,
  };

  const handleLogout = () => {
    localStorage.removeItem('nise_user');
    window.location.href = '/';
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-50 w-72 bg-white border-r border-slate-200 h-full transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-2xl tracking-tighter text-slate-900">NISE</div>
            <div className="text-[10px] text-blue-600 -mt-1">INTELIGÊNCIA ESCOLAR</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-6 flex-1 overflow-auto">
          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-blue-50 text-blue-700 rounded-2xl">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/calls" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-2xl">
              <FileText className="w-4 h-4" />
              Chamados
            </Link>
            <Link href="/new-call" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-2xl">
              <Plus className="w-4 h-4" />
              Nova Ocorrência
            </Link>
            <Link href="/schools" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-2xl">
              <SchoolIcon className="w-4 h-4" />
              Escolas
            </Link>
            {user.role === 'admin' && (
              <Link href="/users" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-2xl">
                <Users className="w-4 h-4" />
                Usuários
              </Link>
            )}
            <Link href="/reports" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-2xl">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-medium text-sm truncate">{user.name}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role}</div>
            </div>
          </div>
          
          <Button onClick={handleLogout} variant="ghost" className="w-full mt-3 text-slate-500 hover:text-red-600 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b px-6 py-5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="font-semibold text-2xl text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">Visão geral das ocorrências • {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              ONLINE
            </div>
            <Button asChild>
              <Link href="/new-call" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nova Ocorrência
              </Link>
            </Button>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">Total</p>
                    <p className="text-4xl font-semibold mt-1 text-slate-900">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-600">Abertos</p>
                    <p className="text-4xl font-semibold mt-1 text-amber-600">{stats.open}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-600">Em Andamento</p>
                    <p className="text-4xl font-semibold mt-1 text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-emerald-600">Finalizados</p>
                    <p className="text-4xl font-semibold mt-1 text-emerald-600">{stats.closed}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-red-600">Urgentes</p>
                    <p className="text-4xl font-semibold mt-1 text-red-600">{stats.urgent}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">Hoje</p>
                    <p className="text-4xl font-semibold mt-1 text-slate-900">3</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <SchoolIcon className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder and Recent Calls */}
          <div className="grid lg:grid-cols-7 gap-6">
            {/* Charts Area */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Ocorrências por Tipo
                  </CardTitle>
                  <CardDescription>Distribuição dos últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center bg-slate-50 rounded-b-3xl">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 rounded-full border-8 border-blue-200 border-t-blue-600 animate-spin mb-6"></div>
                    <p className="text-slate-400">Gráficos interativos com Recharts seriam renderizados aqui</p>
                    <p className="text-xs text-slate-500 mt-1">(Integração completa em produção)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ocorrências por Escola (Top 5)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 pt-2">
                    {['CEI Luiz Felipe', 'CEM São Cristóvão', 'EM Paulo Freire', 'ERM Cora Coralina', 'CEI Arco Íris'].map((school, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-6 text-right text-xs text-slate-400 font-mono">{(i+1).toString().padStart(2, '0')}</div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-r-full" 
                            style={{ width: `${85 - i * 12}%` }}
                          ></div>
                        </div>
                        <div className="font-medium text-sm w-40 truncate">{school}</div>
                        <div className="font-mono text-xs bg-slate-100 px-3 py-0.5 rounded">{(12 - i * 2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Calls */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Chamados Recentes</CardTitle>
                    <CardDescription>Últimas ocorrências registradas</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/calls">Ver todos</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredCalls.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${call.priority === 'Urgente' ? 'bg-red-500' : call.priority === 'Alta' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <div className="font-medium text-sm">{call.number}</div>
                          <div className={`text-[10px] px-2.5 py-px rounded font-medium ${call.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : call.status === 'Aberto' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {call.status}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">{call.school?.name}</div>
                        <div className="text-xs line-clamp-2 text-slate-600 mt-2">{call.description}</div>
                        
                        <div className="mt-3 flex items-center justify-between text-[10px]">
                          <div className="text-slate-400">{format(call.date, 'dd/MM HH:mm')}</div>
                          <div className="font-medium text-slate-500">{call.priority}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <footer className="border-t bg-white py-4 px-8 text-center text-xs text-slate-400">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0 • Todos os módulos apresentam este rodapé
        </footer>
      </div>
    </div>
  );
}
