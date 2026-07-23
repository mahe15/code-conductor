export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  agent?: {
    name: string;
    binary: string;
  };
  enabled: boolean;
}

export class PluginLoaderService {
  private plugins: PluginManifest[] = [
    {
      id: 'aider-agent-plugin',
      name: 'Aider AI CLI Adapter',
      version: '1.2.0',
      description: 'Adds native support for Aider pair programming CLI agent',
      agent: { name: 'Aider', binary: 'aider' },
      enabled: true,
    },
    {
      id: 'roo-code-plugin',
      name: 'Roo Code Extension',
      version: '2.0.1',
      description: 'Custom interceptor rules for Roo Code agent workflows',
      enabled: true,
    },
  ];

  public getPlugins(): PluginManifest[] {
    return this.plugins;
  }

  public togglePlugin(id: string) {
    this.plugins = this.plugins.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
  }
}
