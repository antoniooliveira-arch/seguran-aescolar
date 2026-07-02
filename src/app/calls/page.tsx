'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Call } from '@/types';
import { Eye, Filter, Plus } from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
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
      },
      {
        id: 4,
        number: "NISE-250004",
        date: new Date(2025, 0, 18, 10, 20),
        schoolId: 3,
        school: { id: 3, name: "CEI Bruno Leonardo", type: "CEI" },
        requester: "Coordenador Pedro Lima",
        phone: "(11) 91234-5678",
        type: "Ameaça",
        priority: "Alta",
        description: "Recebemos ligação ameaçadora dizendo que havia uma bomba na escola.",
        team: "Equipe Delta",
        status: "Em análise",
        createdAt: new Date(2025, 0, 18, 10, 20),
        updatedAt: new Date(2025, 0, 18, 10, 20),
      }
    ];
    
    setCalls(mockCalls);
    setFilteredCalls(mockCalls);
  }, []);

  useEffect(() => {
    let result = [...calls];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(call => 
        call.school?.name.toLowerCase().includes(term) ||
        call.description.toLowerCase().includes(term) ||
        call.number.toLowerCase().includes(term) ||
        call.requester.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(call => call.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(call => call.priority === priorityFilter);
    }

    setFilteredCalls(result);
  }, [calls, searchTerm, statusFilter, priorityFilter]);

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
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Chamados</h1>
            <p className="text-slate-500">Lista completa de ocorrências registradas no NISE</p>
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
                    <Link href={`/calls/${call.id}`} className="text-blue-600 hover:text-blue-700 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </Link>
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
