'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { UserRole, ROLE_LABELS } from '@/types';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'operador_cftv' as UserRole,
    password: '123456',
  });

  const loadUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (!storedUser || JSON.parse(storedUser).role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Usuário cadastrado com sucesso!');
        setShowForm(false);
        setFormData({ name: '', email: '', role: 'operador_cftv', password: '123456' });
        loadUsers();
      } else {
        toast.error('Erro ao cadastrar usuário.');
      }
    } catch {
      toast.error('Erro ao conectar com o servidor.');
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    supervisor: 'bg-blue-100 text-blue-700',
    tatico: 'bg-purple-100 text-purple-700',
    operador_cftv: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Usuários</h1>
            <p className="text-slate-500">Gerenciamento de perfis e acesso ao sistema</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Usuário
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Cadastrar Novo Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nome</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Perfil</label>
                  <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}>
                    <option value="operador_cftv">Operador de CFTV</option>
                    <option value="tatico">Tático</option>
                    <option value="supervisor">Supervisor</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Senha</label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="123456" />
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Cadastrar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-5 px-8 font-medium text-xs uppercase tracking-widest text-slate-500">Nome</th>
                  <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Email</th>
                  <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Perfil</th>
                  <th className="text-left py-5 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-8 font-medium">{u.name}</td>
                    <td className="py-5 px-4 text-sm text-slate-600">{u.email}</td>
                    <td className="py-5 px-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${roleColors[u.role] || 'bg-slate-100'}`}>
                        {ROLE_LABELS[u.role as UserRole] || u.role}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      {u.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <UserCheck className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <UserX className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-400">Nenhum usuário cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="text-xs text-center text-slate-400 mt-8">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
      </div>
    </div>
  );
}
