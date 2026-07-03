'use client';

import { Suspense, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Call, User } from '@/types';
import { ArrowLeft, Eye, Filter, Plus } from 'lucide-react';

function CallsContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const typeFilter = searchParams.get('type');

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));

    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const parsed = data.map((c: any) => ({ ...c, date: new Date(c.date), createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt), closingDate: c.closingDate ? new Date(c.closingDate) : undefined }));
          setCalls(parsed);
          setFilteredCalls(parsed);
        }
      })
      .catch(err => console.error('Error fetching calls:', err));
  }, []);

  useEffect(() => {
    let result = [...calls];

    if (user?.role === 'operador_cftv') {
      result = result.filter(c => c.status === 'Aberto');
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(call => 
        call.school?.name.toLowerCase().includes(term) ||
        call.description.toLowerCase().includes(term) ||
        call.number.toLowerCase().includes(term) ||
        call.requester.toLowerCase().includes(term)
      );
    }

    if (statusFilter === 'urgent') {
      result = result.filter(call => call.priority === 'Urgente');
    } else if (statusFilter !== 'all') {
      const statusGroups: Record<string, string[]> = {
        open: ['Aberto', 'Em análise', 'Encaminhado'],
        inprogress: ['Em atendimento', 'Aguardando parecer'],
        closed: ['Concluído'],
      };
      const statuses = statusGroups[statusFilter];
      if (statuses) {
        result = result.filter(call => statuses.includes(call.status));
      } else {
        result = result.filter(call => call.status === statusFilter);
      }
    }

    const typeParam = searchParams.get('type');
    if (typeParam) {
      result = result.filter(call => call.type === typeParam);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(call => call.priority === priorityFilter);
    }

    setFilteredCalls(result);
  }, [calls, searchTerm, statusFilter, priorityFilter, searchParams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-amber-100 text-amber-700';
      case 'Em análise': return 'bg-purple-100 text-purple-700';
      case 'Em atendimento': return 'bg-blue-100 text-blue-700';
      case 'Concluído': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight">Chamados</h1>
              {typeFilter && (
                <Link href="/calls" className="text-xs text-blue-600 hover:text-blue-800 underline">
                  Limpar filtro
                </Link>
              )}
            </div>
            <p className="text-slate-500">
              {typeFilter
                ? <>Filtrando por tipo: <span className="font-medium text-blue-700">{typeFilter}</span></>
                : 'Lista completa de ocorrências registradas no NISE'}
            </p>
          </div>
          <Button asChild className="flex items-center gap-2">
            <Link href="/new-call">
              <Plus className="w-4 h-4" /> Nova Ocorrência
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por escola, descrição ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="w-full md:w-52">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Todos os Status</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Concluído">Concluído</option>
                </Select>
              </div>
              <div className="w-full md:w-52">
                <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="all">Todas Prioridades</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4" /> Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-5 px-8 font-medium text-xs uppercase tracking-widest text-slate-500">Número</th>
                <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Escola</th>
                <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Tipo</th>
                <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Data</th>
                <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Status</th>
                <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Prioridade</th>
                <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Responsável</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => (
                <tr key={call.id} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                  <td className="py-6 px-8 font-mono text-sm font-medium text-slate-900">{call.number}</td>
                  <td className="py-6 px-4 text-sm">{call.school?.name}</td>
                  <td className="py-6 px-4 text-sm text-slate-600">{call.type}</td>
                  <td className="py-6 px-4 text-sm text-slate-500">
                    {format(call.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="py-6 px-4">
                    <span className={`inline-block text-xs px-4 py-1 rounded-3xl font-medium ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="py-6 px-4">
                    <span className={`text-xs px-3 py-1 rounded font-medium
                      ${call.priority === 'Urgente' ? 'bg-red-100 text-red-700' : 
                        call.priority === 'Alta' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {call.priority}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-sm text-slate-600">{call.responsible || '—'}</td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-2">
                      {user?.role === 'operador_cftv' && call.status === 'Aberto' && (
                        <Link href={`/calls/${call.id}`} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                          Registrar
                        </Link>
                      )}
                      <Link href={`/calls/${call.id}`} className="text-blue-600 hover:text-blue-700 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCalls.length === 0 && (
            <div className="p-20 text-center text-slate-400">
              Nenhum chamado encontrado com os filtros aplicados.
            </div>
          )}
        </div>

        <div className="text-xs text-center text-slate-400 mt-8">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
      </div>
    </div>
  );
}

export default function CallsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <CallsContent />
    </Suspense>
  );
}
