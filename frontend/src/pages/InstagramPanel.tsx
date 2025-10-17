import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import InstagramFilterSidebar, { type InstagramFilterValues } from '../components/features/InstagramFilterSidebar';
import { WBRChart } from '@/components/features/WBRChart';
import type { WBRData } from '@/types/wbr.types';

interface TopPost {
  id: number;
  imageUrl: string;
  instagramUrl: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export function InstagramPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [filters, setFilters] = useState<InstagramFilterValues>({
    date: '',
    shopping: '',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleFilterChange = (newFilters: InstagramFilterValues) => {
    setFilters(newFilters);
    console.log('Filtros atualizados:', newFilters);
    // Aqui futuramente você vai chamar a API com os filtros
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Dados mocados para os KPIs do Instagram
  const kpiData = [
    { title: 'Total de Seguidores', value: '47.8K', change: '+8.3%', positive: true },
    { title: 'Engajamento Médio', value: '6.2%', change: '+1.5%', positive: true },
    { title: 'Alcance do Mês', value: '152K', change: '+15.7%', positive: true },
    { title: 'Taxa de Salvamento', value: '4.8%', change: '+0.9%', positive: true },
  ];

  // Função para gerar dados mocados do WBR para Likes
  const gerarDadosMocadosLikes = (): WBRData => {
    const datasSemanasAtual: Date[] = [];
    const datasSemanasAnterior: Date[] = [];
    const hoje = new Date();

    for (let i = 7; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (i * 7));
      datasSemanasAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasSemanasAnterior.push(dataAnterior);
    }

    const datasMesesAtual: Date[] = [];
    const datasMesesAnterior: Date[] = [];

    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), i, 1);
      datasMesesAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasMesesAnterior.push(dataAnterior);
    }

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 2500 + Math.random() * 800;
      const crescimento = i * 150;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 2000 + Math.random() * 600;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 10000 + Math.random() * 3000;
        const crescimento = i * 600;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 8000 + Math.random() * 2500;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: {
        metric_value: valoresSemanasCY,
        index: datasSemanasAtual,
      },
      semanas_py: {
        metric_value: valoresSemanasAnterior,
        index: datasSemanasAnterior,
      },
      meses_cy: {
        metric_value: valoresMesesCY,
        index: datasMesesAtual,
      },
      meses_py: {
        metric_value: valoresMesesAnterior,
        index: datasMesesAnterior,
      },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função para gerar dados mocados do WBR para Comentários
  const gerarDadosMocadosComentarios = (): WBRData => {
    const datasSemanasAtual: Date[] = [];
    const datasSemanasAnterior: Date[] = [];
    const hoje = new Date();

    for (let i = 7; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (i * 7));
      datasSemanasAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasSemanasAnterior.push(dataAnterior);
    }

    const datasMesesAtual: Date[] = [];
    const datasMesesAnterior: Date[] = [];

    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), i, 1);
      datasMesesAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasMesesAnterior.push(dataAnterior);
    }

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 180 + Math.random() * 50;
      const crescimento = i * 12;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 140 + Math.random() * 40;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 750 + Math.random() * 200;
        const crescimento = i * 45;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 600 + Math.random() * 150;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: {
        metric_value: valoresSemanasCY,
        index: datasSemanasAtual,
      },
      semanas_py: {
        metric_value: valoresSemanasAnterior,
        index: datasSemanasAnterior,
      },
      meses_cy: {
        metric_value: valoresMesesCY,
        index: datasMesesAtual,
      },
      meses_py: {
        metric_value: valoresMesesAnterior,
        index: datasMesesAnterior,
      },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função auxiliar para gerar estrutura de datas
  const gerarEstruturaBase = () => {
    const datasSemanasAtual: Date[] = [];
    const datasSemanasAnterior: Date[] = [];
    const hoje = new Date();

    for (let i = 7; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (i * 7));
      datasSemanasAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasSemanasAnterior.push(dataAnterior);
    }

    const datasMesesAtual: Date[] = [];
    const datasMesesAnterior: Date[] = [];

    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), i, 1);
      datasMesesAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasMesesAnterior.push(dataAnterior);
    }

    return { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje };
  };

  // Função para gerar dados mocados - Impressões
  const gerarDadosMocadosImpressoes = (): WBRData => {
    const { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje } = gerarEstruturaBase();

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 15000 + Math.random() * 5000;
      const crescimento = i * 800;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 12000 + Math.random() * 4000;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 60000 + Math.random() * 15000;
        const crescimento = i * 3000;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 50000 + Math.random() * 12000;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: { metric_value: valoresSemanasCY, index: datasSemanasAtual },
      semanas_py: { metric_value: valoresSemanasAnterior, index: datasSemanasAnterior },
      meses_cy: { metric_value: valoresMesesCY, index: datasMesesAtual },
      meses_py: { metric_value: valoresMesesAnterior, index: datasMesesAnterior },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função para gerar dados mocados - Alcance
  const gerarDadosMocadosAlcance = (): WBRData => {
    const { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje } = gerarEstruturaBase();

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 8500 + Math.random() * 2500;
      const crescimento = i * 450;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 7000 + Math.random() * 2000;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 35000 + Math.random() * 8000;
        const crescimento = i * 1800;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 28000 + Math.random() * 6000;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: { metric_value: valoresSemanasCY, index: datasSemanasAtual },
      semanas_py: { metric_value: valoresSemanasAnterior, index: datasSemanasAnterior },
      meses_cy: { metric_value: valoresMesesCY, index: datasMesesAtual },
      meses_py: { metric_value: valoresMesesAnterior, index: datasMesesAnterior },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função para gerar dados mocados - Engajamento Total
  const gerarDadosMocadosEngajamento = (): WBRData => {
    const { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje } = gerarEstruturaBase();

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 3200 + Math.random() * 900;
      const crescimento = i * 180;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 2600 + Math.random() * 700;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 13000 + Math.random() * 3500;
        const crescimento = i * 750;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 10500 + Math.random() * 2800;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: { metric_value: valoresSemanasCY, index: datasSemanasAtual },
      semanas_py: { metric_value: valoresSemanasAnterior, index: datasSemanasAnterior },
      meses_cy: { metric_value: valoresMesesCY, index: datasMesesAtual },
      meses_py: { metric_value: valoresMesesAnterior, index: datasMesesAnterior },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função para gerar dados mocados - Compartilhamentos
  const gerarDadosMocadosCompartilhamentos = (): WBRData => {
    const { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje } = gerarEstruturaBase();

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 120 + Math.random() * 40;
      const crescimento = i * 8;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 95 + Math.random() * 30;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 500 + Math.random() * 150;
        const crescimento = i * 35;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 400 + Math.random() * 120;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: { metric_value: valoresSemanasCY, index: datasSemanasAtual },
      semanas_py: { metric_value: valoresSemanasAnterior, index: datasSemanasAnterior },
      meses_cy: { metric_value: valoresMesesCY, index: datasMesesAtual },
      meses_py: { metric_value: valoresMesesAnterior, index: datasMesesAnterior },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função para gerar dados mocados - Salvamentos
  const gerarDadosMocadosSalvamentos = (): WBRData => {
    const { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje } = gerarEstruturaBase();

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 450 + Math.random() * 120;
      const crescimento = i * 30;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 350 + Math.random() * 90;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 1800 + Math.random() * 450;
        const crescimento = i * 120;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 1400 + Math.random() * 350;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: { metric_value: valoresSemanasCY, index: datasSemanasAtual },
      semanas_py: { metric_value: valoresSemanasAnterior, index: datasSemanasAnterior },
      meses_cy: { metric_value: valoresMesesCY, index: datasMesesAtual },
      meses_py: { metric_value: valoresMesesAnterior, index: datasMesesAnterior },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  // Função para gerar dados mocados - Posts Publicados
  const gerarDadosMocadosPostsPublicados = (): WBRData => {
    const { datasSemanasAtual, datasSemanasAnterior, datasMesesAtual, datasMesesAnterior, hoje } = gerarEstruturaBase();

    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data) => {
      const baseValue = 5 + Math.random() * 3;
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue);
    });

    datasSemanasAnterior.forEach((data) => {
      const baseValue = 4 + Math.random() * 2;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 20 + Math.random() * 8;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 18 + Math.random() * 6;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: { metric_value: valoresSemanasCY, index: datasSemanasAtual },
      semanas_py: { metric_value: valoresSemanasAnterior, index: datasSemanasAnterior },
      meses_cy: { metric_value: valoresMesesCY, index: datasMesesAtual },
      meses_py: { metric_value: valoresMesesAnterior, index: datasMesesAnterior },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true,
      mes_parcial_py: false,
    };
  };

  const dadosImpressoes = gerarDadosMocadosImpressoes();
  const dadosAlcance = gerarDadosMocadosAlcance();
  const dadosEngajamento = gerarDadosMocadosEngajamento();
  const dadosLikes = gerarDadosMocadosLikes();
  const dadosComentarios = gerarDadosMocadosComentarios();
  const dadosCompartilhamentos = gerarDadosMocadosCompartilhamentos();
  const dadosSalvamentos = gerarDadosMocadosSalvamentos();
  const dadosPostsPublicados = gerarDadosMocadosPostsPublicados();

  // Dados mocados para Top 4 Postagens
  const topPosts: TopPost[] = [
    {
      id: 1,
      imageUrl: 'https://scontent-ord5-3.cdninstagram.com/v/t51.82787-15/565524004_18537990667021608_3386782723609994187_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ccb=1-7&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=hHHFWLHIVRIQ7kNvwHONcg3&_nc_oc=Adnrrwkk6espZnGgvptR5W2jsi-jB0HXp71DDOGSaMufAxsJKLQDrMQCkHqFGtjfLx4&_nc_zt=23&_nc_ht=scontent-ord5-3.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=Gq8TaJ2iEtqF71yk2EZMYA&oh=00_AfdoMd9tbxKb0gmlp2kK7S-s3Ocv3xMJCnWgsaOmxQP6Qg&oe=68F67F74',
      instagramUrl: 'https://www.instagram.com/reel/DP2eJX3EZOO/',
      likes: 3542,
      comments: 287,
      shares: 156,
      saves: 892,
    },
    {
      id: 2,
      imageUrl: 'https://scontent-ord5-1.cdninstagram.com/v/t51.71878-15/564716473_1524012242350709_4334273889102638946_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=1-7&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=zeXhMY96EvoQ7kNvwGM_gOf&_nc_oc=Adl0zPvPEEi1E9aJHiWmz42edAYW5kbjbVKrMVjjWIBWa4_Jv251rScG_PXywkRUdrI&_nc_zt=23&_nc_ht=scontent-ord5-1.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=Gq8TaJ2iEtqF71yk2EZMYA&oh=00_AfduAkxnxvrECu7NwDoWdXL0gaCTdlm45wA8aaKWsj4ATQ&oe=68F67DB4',
      instagramUrl: 'https://www.instagram.com/reel/DP1RevyAPJF/',
      likes: 3201,
      comments: 245,
      shares: 134,
      saves: 756,
    },
    {
      id: 3,
      imageUrl: 'https://scontent-ord5-3.cdninstagram.com/v/t51.71878-15/564918418_692646816651594_7844173345319510618_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=1-7&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=9awI81BZKd0Q7kNvwHxk6pf&_nc_oc=AdlFmZ4B3kN79nBZaMTvrSSiScBhj8_8EpOL0eJ5T709mjAvgxeK9uVWGyjGw4KkBkY&_nc_zt=23&_nc_ht=scontent-ord5-3.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=W8UeWVttXnRWpMmtgsRPVw&oh=00_AfeAhjsZ719LRr_nFPbL_W0uKRDhcVRspIZ_N-K3Mnp2Ag&oe=68F50277',
      instagramUrl: 'https://www.instagram.com/reel/DPzPxMCAQpe/',
      likes: 2987,
      comments: 213,
      shares: 98,
      saves: 634,
    },
    {
      id: 4,
      imageUrl: 'https://scontent-ord5-2.cdninstagram.com/v/t51.71878-15/564248386_1865078027774989_2053650634078763593_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=1-7&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_eui2=AeFL1IZKUi_uCUze1YAgnHQAqUZrZcR8QL2pRmtlxHxAvTosGMuhCfflaXpv4_AOq8o&_nc_ohc=cArYkUhEKXMQ7kNvwH6ZLcF&_nc_oc=AdmI_r8LOMfiuOQGiM9hCZvM9xwbgLm5OLpbi3gDI9eJDv8IRkvPGH8suYt05FG6vCM&_nc_zt=23&_nc_ht=scontent-ord5-2.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=uvHPE4Pa0gGkPIHle4bWEg&oh=00_AfeDJAWaMO0dk3y1Z6cSwPzGia7SZgKtRk6EojpQtDWzAw&oe=68F25A4B',
      instagramUrl: 'https://www.instagram.com/reel/DPut1inkd_-/',
      likes: 2756,
      comments: 189,
      shares: 87,
      saves: 543,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background relative">
      <InstagramFilterSidebar
        onFilterChange={handleFilterChange}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div
        className={cn(
          'flex-1 p-8 flex flex-col gap-6 transition-all duration-300 box-border',
          isSidebarCollapsed ? 'ml-[60px]' : 'ml-[280px]'
        )}
      >
        {/* Header */}
        <header className="flex flex-col items-center justify-center mb-6 text-center relative">
          <div className="absolute right-0 top-0 flex gap-2">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              Operações
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sair
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Painel do Instagram
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {filters.shopping
              ? `Shopping: ${filters.shopping}`
              : 'Análise de performance do Instagram'}
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          {kpiData.map((kpi, index) => (
            <Card
              key={index}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-foreground mb-2">
                  {kpi.value}
                </p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    kpi.positive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top 4 Postagens do Mês */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Top 4 Postagens do Mês por Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-3 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
                >
                  {/* Imagem do Post */}
                  <a
                    href={post.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full h-[300px] bg-muted block group cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt={`Post ${post.id}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-pink-600"
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                      #{post.id}
                    </div>
                  </a>

                  {/* Métricas do Post */}
                  <div className="p-4 bg-secondary/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-pink-600"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                          <span className="text-xs text-muted-foreground font-medium">Likes</span>
                        </div>
                        <span className="text-lg font-bold text-pink-600">{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-600"
                          >
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                          </svg>
                          <span className="text-xs text-muted-foreground font-medium">Coment.</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{post.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-600"
                          >
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" x2="12" y1="2" y2="15" />
                          </svg>
                          <span className="text-xs text-muted-foreground font-medium">Compart.</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">{post.shares.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-purple-600"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <path d="m9 11 3 3L22 4" />
                          </svg>
                          <span className="text-xs text-muted-foreground font-medium">Salvos</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{post.saves.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 1. Gráfico WBR - Impressões */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosImpressoes}
              titulo="Total de Impressões - WBR"
              unidade="impressões"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 2. Gráfico WBR - Alcance */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosAlcance}
              titulo="Alcance Total - WBR"
              unidade="alcance"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 3. Gráfico WBR - Engajamento Total */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosEngajamento}
              titulo="Engajamento Total - WBR"
              unidade="engajamentos"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 4. Gráfico WBR - Likes */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosLikes}
              titulo="Total de Likes - WBR"
              unidade="likes"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 5. Gráfico WBR - Comentários */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosComentarios}
              titulo="Total de Comentários - WBR"
              unidade="comentários"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 6. Gráfico WBR - Compartilhamentos */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosCompartilhamentos}
              titulo="Total de Compartilhamentos - WBR"
              unidade="compartilhamentos"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 7. Gráfico WBR - Salvamentos */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosSalvamentos}
              titulo="Total de Salvamentos - WBR"
              unidade="salvamentos"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* 8. Gráfico WBR - Posts Publicados */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosPostsPublicados}
              titulo="Posts Publicados - WBR"
              unidade="posts"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* Charts Grid - Outros Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Horários de Maior Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipo de Conteúdo Mais Popular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Seguidores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Resposta a DMs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InstagramPanel;
