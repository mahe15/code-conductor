import { create } from 'zustand';

export type ActiveTab = 'terminal' | 'memory' | 'timeline' | 'risk' | 'voice' | 'settings';

interface UIState {
  activeTab: ActiveTab;
  isDecisionModalOpen: boolean;
  isVoiceModeActive: boolean;
  activeDecisionEvent: any | null;

  setActiveTab: (tab: ActiveTab) => void;
  setDecisionModalOpen: (open: boolean) => void;
  setVoiceModeActive: (active: boolean) => void;
  triggerDecisionModal: (event: any) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'terminal',
  isDecisionModalOpen: false,
  isVoiceModeActive: false,
  activeDecisionEvent: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDecisionModalOpen: (open) => set({ isDecisionModalOpen: open }),
  setVoiceModeActive: (active) => set({ isVoiceModeActive: active }),
  triggerDecisionModal: (event) => set({ activeDecisionEvent: event, isDecisionModalOpen: true }),
}));
