'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LogIn, Shield, Users, BarChart3, School } from 'lucide-react';
import Link from 'next/link';

interface DemoUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  const demoCredentials = [
    { id: 1, username: 'admin', name: 'Administrador', role: 'Administrador' },
    { id: 2, username: 'supervisor', name: 'Supervisor', role: 'Supervisor' },
    { id: 3, username: 'tatico', name: 'Tático', role: 'Tático' },
    { id: 4, username: 'operador', name: 'Operador de CFTV', role: 'Operador CFTV' },
  ];

  useEffect(() => {
    // Seed the database on first load
    fetch('/api/seed')
      .then(res => res.json())
      .then(data => {
        console.log('Seed result:', data);
        setDemoUsers(demoCredentials);
      })
      .catch(err => console.error('Seed failed', err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Mock authentication - in production would use Supabase or JWT
    const foundUser = demoCredentials.find(u => u.username === username);
    
    if (foundUser && password === '123') {
      // Store user in localStorage for demo
      localStorage.setItem('nise_user', JSON.stringify({
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        role: foundUser.role.toLowerCase().includes('admin') ? 'admin' : 
              foundUser.role.toLowerCase().includes('supervisor') ? 'supervisor' : 
              foundUser.role.toLowerCase().includes('tático') ? 'tatico' : 'operador_cftv'
      }));
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } else {
      setMessage('Credenciais inválidas. Use usuário "admin" e senha "123" para acessar como administrador.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-9 h-9" />
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight">NISE</div>
              <div className="text-blue-400 text-sm -mt-1">SEGURANÇA ESCOLAR</div>
            </div>
          </div>
          
          <h1 className="text-6xl font-semibold leading-none tracking-tighter mb-6">
            Núcleo de<br />Inteligência<br />Segurança Escolar
          </h1>
          
          <p className="text-xl text-slate-400 max-w-md">
            Sistema integrado de registro, acompanhamento e análise de ocorrências escolares.
          </p>

          <div className="mt-auto pt-16 text-sm text-slate-500 space-y-2">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4" /> 23 unidades cadastradas
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Dashboard em tempo real
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" /> RBAC completo (Admin, Supervisor, Operador)
            </div>
          </div>
          
          <div className="mt-12 text-xs text-slate-500 border-t border-slate-800 pt-6">
            Secretaria Municipal de Educação • Departamento de Tecnologia
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12">
          <div className="flex justify-center mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-slate-900">NISE</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-600 mt-2">Entre com suas credenciais para acessar o sistema.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuário</label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : (
                <>
                  <LogIn className="w-5 h-5" /> Entrar no Sistema
                </>
              )}
            </Button>

            {message && (
              <div className="text-center text-sm p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
                {message}
              </div>
            )}
          </form>

          <div className="mt-10 border-t pt-8">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Usuários de demonstração</p>
            
            <div className="space-y-3">
              {demoUsers.map((user, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    setUsername(user.username);
                    setPassword('123');
                  }}
                  className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-all active:scale-[0.985]"
                >
                  <div>
                    <div className="font-medium text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500 font-mono">usuário: {user.username}</div>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {user.role}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 text-[10px] text-slate-400">
              Usuário <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">admin</span> • Senha <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">123</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-10">
            Desenvolvido pelo Departamento de Tecnologia da SME • Versão 1.0
          </div>
        </div>
      </div>
    </div>
  );
}
