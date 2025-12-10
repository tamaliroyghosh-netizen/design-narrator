import React, { useState, createContext, useContext } from "react";

export const AnalysisEditorContext = createContext(null);

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------
export function AnalysisEditorProvider({ children }) {
  const [blocks, setBlocks] = useState([]);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [view, setView] = useState("landing");

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

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------
export function useAnalysisEditor() {
  const ctx = useContext(AnalysisEditorContext);
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

// ------------------------------------------------------------
// ROOT APP COMPONENT (THIS IS WHAT main.jsx WILL RENDER)
// ------------------------------------------------------------
export default function AppWrapped() {
  const { view } = useAnalysisEditor();

  return (
    <AnalysisEditorProvider>
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <h1>Design Narrator</h1>
        <p>Your app is now rendering successfully 🎉</p>

        <p>Current view: <b>{view}</b></p>
      </div>
    </AnalysisEditorProvider>
  );
}
