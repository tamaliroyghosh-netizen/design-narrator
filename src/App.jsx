import React, { useState, createContext, useContext } from "react";

export const AnalysisEditorContext = createContext(null);

// ------------------------------------------------------------------
// Provider (top-level)
// ------------------------------------------------------------------
export function AnalysisEditorProvider({ children }) {
  const [blocks, setBlocks] = useState([]);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [view, setView] = useState('landing');

  function pushBlocks(newBlocks) {
    setBlocks(prev => {
      const map = new Map(prev.map(b => [b.id, b]));
      newBlocks.forEach(b => map.set(b.id, b));
      return Array.from(map.values());
    });
  }

  function updateBlock(id, patch) {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
  }

  function acceptBlock(id) {
    setAcceptedIds(s => new Set(s).add(id));
    updateBlock(id, { accepted: true });
  }

  function removeBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setAcceptedIds(s => {
      const copy = new Set(s);
      copy.delete(id);
      return copy;
    });
  }

  function clearAll() {
    setBlocks([]);
    setAcceptedIds(new Set());
  }

  const value = {
    blocks,
    pushBlocks,
    updateBlock,
    acceptBlock,
    removeBlock,
    clearAll,
    acceptedIds,
    view,
    setView
  };

  return (
    <AnalysisEditorContext.Provider value={value}>
      {children}
    </AnalysisEditorContext.Provider>
  );
}

// ------------------------------------------------------------------
// SAFE HOOK (this must be OUTSIDE the provider)
// ------------------------------------------------------------------
export function useAnalysisEditor() {
  const ctx = useContext(AnalysisEditorContext);

  // fallback instead of error
  if (!ctx) {
    return {
      blocks: [],
      pushBlocks: () => {},
      updateBlock: () => {},
      acceptBlock: () => {},
      removeBlock: () => {},
      clearAll: () => {},
      acceptedIds: new Set(),
      view: "landing",
      setView: () => {}
    };
  }

  return ctx;
}
