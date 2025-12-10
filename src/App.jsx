import React, { useState, createContext, useContext } from "react";

export const AnalysisEditorContext = createContext(null);

export function AnalysisEditorProvider({ children }) {
  const [blocks, setBlocks] = useState([]);
  const [view, setView] = useState('landing');

  function pushBlocks(newBlocks) {
    setBlocks((prev) => {
      const map = new Map(prev.map((b) => [b.id, b]));
      newBlocks.forEach((b) => map.set(b.id, b));
      return Array.from(map.values());
    });
  }

  function updateBlock(id, patch) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function acceptBlock(id) {
    updateBlock(id, { accepted: true });
  }

  return (
    <AnalysisEditorContext.Provider value={{ blocks, pushBlocks, updateBlock, acceptBlock, view, setView }}>
      {children}
    </AnalysisEditorContext.Provider>
  );
}

export function useAnalysisEditor() {
  const ctx = useContext(AnalysisEditorContext);
  if (!ctx) throw new Error("useAnalysisEditor must be used inside AnalysisEditorProvider");
  return ctx;
}

function DesignNarratorLanding() {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const { pushBlocks, setView } = useAnalysisEditor();

  function sampleFromNotes(text) {
    const snippet = (text || "").trim().slice(0, 220);
    return [
      { id: "b1", type: "Problem", title: "Problem summary", extractedText: snippet || "Users were confused about the workflow.", accepted: false },
      { id: "b2", type: "Research", title: "Research note", extractedText: snippet ? `Notes: ${snippet}` : "Research shows progress indicators were missed.", accepted: false }
    ];
  }

  function handleSend() {
    setStatus("Processing...");
    const sample = sampleFromNotes(notes);
    pushBlocks(sample);
    setTimeout(()=> setView('editor'), 400);
  }

  return (
    <div style={{padding:20}}>
      <h1>Design Narrator</h1>
      <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{width:'100%',height:120}} placeholder="Paste messy notes..."/>
      <div style={{marginTop:8}}>
        <button onClick={()=>{setNotes(''); setStatus('')}}>Clear</button>
        <button onClick={handleSend} style={{marginLeft:8}}>Send & Process</button>
      </div>
      <div style={{marginTop:8,color:'#999'}}>{status}</div>
    </div>
  );
}

function EditorScreen() {
  const { blocks = [], acceptBlock } = useAnalysisEditor();
  const [selectedId, setSelectedId] = useState(blocks[0]?.id || null);
  const [drafts, setDrafts] = useState(() => Object.fromEntries((blocks||[]).map(b=>[b.id, b.extractedText || ''])));

  React.useEffect(()=>{
    setDrafts(Object.fromEntries((blocks||[]).map(b=>[b.id, b.extractedText || ''])));
    if(!selectedId && blocks[0]) setSelectedId(blocks[0].id);
  },[blocks]);

  function updateDraft(id, text){
    setDrafts(d=>({...d,[id]:text}));
    updateBlock(id, { extractedText: text });
  }

  return (
    <div style={{padding:20}}>
      <h2>Editor</h2>
      <div style={{display:'flex',gap:12}}>
        <div style={{width:220}}>
          {(blocks||[]).map(b=> (
            <div key={b.id} style={{padding:8,border:'1px solid #333',marginBottom:8}}>
              <div onClick={()=>setSelectedId(b.id)} style={{cursor:'pointer'}}>
                <div style={{fontSize:12,color:'#888'}}>{b.type}</div>
                <div style={{fontWeight:600}}>{b.title}</div>
                <div style={{fontSize:12,color:'#666'}}>{b.extractedText}</div>
              </div>
              <div style={{marginTop:8}}>
                <button onClick={()=>acceptBlock(b.id)}>Accept</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{flex:1}}>
          {selectedId ? (
            <textarea value={drafts[selectedId]||''} onChange={(e)=>updateDraft(selectedId,e.target.value)} style={{width:'100%',height:300}} />
          ) : <div>No block selected</div>}
        </div>
      </div>
    </div>
  );
}

export default function AppWrapped() {
  const { view = 'landing' } = useAnalysisEditor();
  if(view === 'editor') return <EditorScreen />;
  return <DesignNarratorLanding />;
}