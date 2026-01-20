import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const Dashboard = () => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Visão Geral</h1>
          <p className="text-slate-400 mt-1">Bem-vindo ao painel de controle TechnoBolt.</p>
        </div>
        <button className="bg-bolt-500 hover:bg-bolt-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-bolt-500/20">
          Novo Relatório
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Ativos" value="1,240" trend="+12%" icon={<TrendingUp />} />
        <StatCard title="Usuários" value="850" trend="+5%" icon={<Users />} />
        <StatCard title="Alertas" value="3" trend="Normal" icon={<AlertCircle />} isWarning />
      </div>

      {/* Content Area - Placeholder para Gráficos/Tabelas */}
      <motion.div variants={itemVariants} className="bg-dark-surface border border-slate-700 rounded-2xl p-6 h-96 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Atividade Recente</h3>
        <div className="w-full h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
          [Área para Gráficos: Recharts ou ApexCharts]
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ title, value, trend, icon, isWarning }: any) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -5 }}
    className="bg-dark-surface border border-slate-700 p-6 rounded-2xl shadow-lg relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-bolt-500 transform scale-150">
        {/* Background Icon Effect */}
        {React.cloneElement(icon, { size: 64 })}
    </div>
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${isWarning ? 'bg-red-500/10 text-red-400' : 'bg-bolt-500/10 text-bolt-400'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${isWarning ? 'text-red-400' : 'text-emerald-400'}`}>{trend}</span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-white mt-1">{value}</p>
  </motion.div>
);
