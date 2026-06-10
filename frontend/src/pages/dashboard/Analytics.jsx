import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchExtendedAnalytics } from '../../store/slices/datasetSlice';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Loader2, 
  TrendingUp, 
  Code, 
  FolderGit2, 
  FileText,
  AlertCircle,
  BrainCircuit,
  Cpu,
  FileCode
} from 'lucide-react';

const COLORS = ['#58a6ff', '#2ea44f', '#db6d28', '#ab7df6', '#ff8b94', '#6e7681', '#f2ca30'];

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, extendedAnalytics } = useSelector((state) => state.dataset);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchExtendedAnalytics());
  }, [dispatch]);

  const globalLoading = analytics.loading || extendedAnalytics.loading;
  const globalError = analytics.error || extendedAnalytics.error;

  if (globalLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-github-blue animate-spin" />
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="p-6 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-lg flex items-center gap-3">
        <AlertCircle className="h-5 w-5 animate-pulse" />
        <p className="text-sm font-semibold">{globalError}</p>
      </div>
    );
  }

  const overview = analytics.overview || {
    totalRecords: 0,
    totalRepos: 0,
    totalLanguages: 0,
    readmeCount: 0
  };

  // Format repository distribution data for Recharts (Top 7)
  const repoData = analytics.repoDistribution
    .slice(0, 7)
    .map(item => ({
      name: (item._id || 'Unknown').split('/').pop(), // Shorten name
      fullName: item._id || 'Unknown',
      records: item.count || 0
    }));

  // Format language metrics for Recharts
  const languageData = analytics.languageMetrics
    .slice(0, 6)
    .map(item => ({
      name: item._id || 'Other',
      value: item.count || 0
    }));

  // Format framework analysis data
  const frameworkData = (extendedAnalytics.frameworkAnalysis || [])
    .map(item => ({
      name: item._id === 'Other/Unknown' ? 'Standard Code' : item._id,
      value: item.count || 0
    }));

  // Format code elements distribution
  const codeElementsData = (extendedAnalytics.codeAnalysis || [])
    .slice(0, 8)
    .map(item => ({
      name: item._id || 'No Element',
      records: item.count || 0
    }));

  const statsCards = [
    { name: 'Total Records', value: overview.totalRecords.toLocaleString(), icon: TrendingUp, color: 'text-github-blue bg-github-blue/10 border border-github-blue/20 dark:border-github-blue/10' },
    { name: 'Active Repositories', value: overview.totalRepos, icon: FolderGit2, color: 'text-purple-500 bg-purple-500/10 border border-purple-500/25 dark:border-purple-500/10' },
    { name: 'Languages Mapped', value: overview.totalLanguages, icon: Code, color: 'text-amber-500 bg-amber-500/10 border border-amber-500/25 dark:border-amber-500/10' },
    { name: 'README Guides', value: overview.readmeCount, icon: FileText, color: 'text-github-green bg-github-green/10 border border-github-green/20 dark:border-github-green/10' },
    { name: 'AI clusters', value: extendedAnalytics.aiCount || 0, icon: BrainCircuit, color: 'text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 dark:border-cyan-500/10' },
    { name: 'ML training datasets', value: extendedAnalytics.mlCount || 0, icon: Cpu, color: 'text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 dark:border-indigo-500/10' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-github-lightText dark:text-white tracking-tight">Analytics Insights</h2>
        <p className="text-sm text-github-lightTextMuted dark:text-github-textMuted">Data distributions and aggregation metrics dynamically fetched from MongoDB.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-5 rounded-lg shadow-sm flex items-center gap-3.5 hover:border-github-lightText/30 dark:hover:border-github-text/30 transition-all duration-150">
              <div className={`p-2.5 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wider leading-none">{card.name}</p>
                <h4 className="text-xl font-extrabold text-github-lightText dark:text-white mt-1.5 leading-none">{card.value}</h4>
              </div>
            </div>
          );
        })}
      </div>
 
      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Repo Distribution Bar Chart */}
        <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 rounded-lg shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-github-lightText dark:text-white mb-6 uppercase tracking-wider">Top Repositories (Record Volume)</h3>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d0d7de" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#21262d" className="hidden dark:block" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-github-lightTextMuted dark:text-github-textMuted" />
                <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-github-lightTextMuted dark:text-github-textMuted" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9', borderRadius: '6px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="records" fill="#58a6ff" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* Language Metrics Pie Chart */}
        <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 rounded-lg shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-github-lightText dark:text-white mb-6 uppercase tracking-wider">Dataset Languages Breakdown</h3>
          <div className="h-80 w-full flex-1 flex flex-col sm:flex-row items-center justify-center">
            {languageData.length === 0 ? (
              <p className="text-github-lightTextMuted dark:text-github-textMuted text-sm">No language data available</p>
            ) : (
              <>
                <div className="h-64 w-64 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9', borderRadius: '6px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend list */}
                <div className="mt-4 sm:mt-0 sm:ml-6 space-y-2 max-h-60 overflow-y-auto w-full">
                  {languageData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2.5 text-sm font-semibold">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-github-lightTextMuted dark:text-github-textMuted truncate max-w-[120px]">{entry.name}</span>
                      <span className="text-github-lightText dark:text-white font-bold ml-auto">{entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Deep-Dives */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-github-lightText dark:text-white tracking-tight mb-1">Advanced Deep-Dives</h3>
          <p className="text-sm text-github-lightTextMuted dark:text-github-textMuted">Framework and code element statistics parsed from instruction text fields.</p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Framework breakdown Doughnut Chart */}
          <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 rounded-lg shadow-sm flex flex-col">
            <h4 className="text-sm font-bold text-github-lightText dark:text-white mb-6 uppercase tracking-wider">Framework Footprint</h4>
            <div className="h-80 w-full flex-1 flex flex-col items-center justify-center">
              {frameworkData.length === 0 ? (
                <p className="text-github-lightTextMuted dark:text-github-textMuted text-sm">No framework data found</p>
              ) : (
                <>
                  <div className="h-44 w-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={frameworkData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {frameworkData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9', borderRadius: '6px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 w-full space-y-2 max-h-32 overflow-y-auto">
                    {frameworkData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                          <span className="text-github-lightTextMuted dark:text-github-textMuted">{entry.name}</span>
                        </div>
                        <span className="text-github-lightText dark:text-white font-bold">{entry.value} records</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
 
          {/* Code elements horizontal bar chart */}
          <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 rounded-lg shadow-sm flex flex-col lg:col-span-2">
            <h4 className="text-sm font-bold text-github-lightText dark:text-white mb-6 uppercase tracking-wider">Code Elements Distribution</h4>
            <div className="h-80 w-full flex-1">
              {codeElementsData.length === 0 ? (
                <p className="text-github-lightTextMuted dark:text-github-textMuted text-sm py-20 text-center">No code element details found</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={codeElementsData}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#21262d" className="hidden dark:block" />
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d0d7de" className="dark:hidden" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-github-lightTextMuted dark:text-github-textMuted" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-github-lightTextMuted dark:text-github-textMuted" width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9', borderRadius: '6px' }} />
                    <Bar dataKey="records" fill="#ab7df6" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Analytics;
