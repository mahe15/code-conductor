import React, { useState } from 'react';
import { PluginLoaderService, PluginManifest } from '../../services/pluginLoader';
import { Package, Power, Plus, CheckCircle2 } from 'lucide-react';

export const PluginManager: React.FC = () => {
  const service = new PluginLoaderService();
  const [plugins, setPlugins] = useState<PluginManifest[]>(service.getPlugins());

  const handleToggle = (id: string) => {
    service.togglePlugin(id);
    setPlugins([...service.getPlugins()]);
  };

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Plugin Architecture & Extensions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Extend Orchestrator capabilities with custom AI CLI agent adapters and assumption interceptor manifests.
          </p>
        </div>

        <button className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
          <Plus className="w-4 h-4" />
          <span>Install Plugin from Manifest</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-slate-100">{plugin.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded">
                    v{plugin.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{plugin.description}</p>
              </div>

              <button
                onClick={() => handleToggle(plugin.id)}
                className={`p-2 rounded-lg border transition ${
                  plugin.enabled
                    ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={plugin.enabled ? 'Plugin Enabled' : 'Plugin Disabled'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span>Manifest: plugin.json</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Extension</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
