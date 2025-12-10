import React, { useState, createContext, useContext, useEffect } from "react";

// Design Narrator — Apple-style Minimal Black theme
// Landing + Analysis↔Editor wiring. Use this as the canvas root component.

// -------------------------
// Analysis ↔ Editor Context
export const AnalysisEditorContext = createContext(null);

export function AnalysisEditorProvider({ children }) {
  const [blocks, setBlocks] = useState([]);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
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
    setAcceptedIds((s) => {
      const copy = new Set(s);
      copy.add(id);
      return copy;
    });
    updateBlock(id, { accepted: true });
  }

  function removeBlock(id) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setAcceptedIds((s) => {
      const copy = new Set(s);
      copy.delete(id);
      return copy;
    });
  }

  function clearAll() {
    setBlocks([]);
    setAcceptedIds(new Set());
  }

  return (
    <AnalysisEditorContext.Provider value={{ blocks, pushBlocks, updateBlock, acceptBlock, removeBlock, clearAll, acceptedIds, view, setView }}>
      {children}
    </AnalysisEditorContext.Provider>
  );
}

export function useAnalysisEditor() {
  const ctx = useContext(AnalysisEditorContext);
  if (!ctx) throw new Error("useAnalysisEditor must be used inside AnalysisEditorProvider");
  return ctx;
}

// -------------------------
// Landing component (minimal Apple black theme)
function DesignNarratorLanding() {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const { pushBlocks, setView } = useAnalysisEditor();

  function sampleFromNotes(text) {
    // very small, deterministic extraction so demo is reproducible
    const snippet = (text || "").trim().slice(0, 220);
    return [
      { id: "b1", type: "Problem", title: "Problem summary", extractedText: snippet || "Users were confused about the workflow.", accepted: false },
      { id: "b2", type: "Research", title: "Research note", extractedText: snippet ? `Notes: ${snippet}` : "Research shows progress indicators were missed.", accepted: false }
    ];
  }

  function handleSend() {
    setStatus("Notes submitted for processing.");

    // create sample extracted blocks from the notes text (agent-sim)
    const sample = sampleFromNotes(notes);
    pushBlocks(sample);

    // simulate processing and then navigate to editor view
    setTimeout(() => {
      setStatus("Processing complete — opening editor.");
      setTimeout(()=>{ setStatus(""); setView('editor'); }, 200);
    }, 600);
  }

  function handleClear() {
    setNotes("");
    setStatus("");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold">DN</div>
          <div>
            <h1 className="text-lg font-semibold">Design Narrator</h1>
            <div className="text-xs text-gray-400">AI · Agentic · Portfolio generator</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <a className="text-sm text-gray-300 hover:text-white">Product</a>
          <a className="text-sm text-gray-300 hover:text-white">Docs</a>
          <a className="text-sm text-gray-300 hover:text-white">Pricing</a>
          <button className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-transparent border border-gray-700 text-sm">Sign in</button>
          <button className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 text-white text-sm">Try it free</button>
        </nav>
      </header>

      <main className="flex min-h-[80vh]">
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 hidden md:block">
          <nav className="space-y-4 text-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Navigation</div>
            <button className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 font-medium text-gray-200">Home</button>
            <button className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 text-gray-400">Projects</button>
            <button className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 text-gray-400">Inputs</button>
            <button className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 text-gray-400">Editor</button>
            <button className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 text-gray-400">Exports</button>
          </nav>
        </aside>

        <section className="flex-1 p-10">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-extrabold leading-tight">Turn messy screens &amp; notes into portfolio-ready case studies — fast.</h2>
            <p className="mt-4 text-gray-400">Upload screenshots or paste messy text. The agents extract structure, insert images, and generate a recruiter-ready UX case study with optional PDF, storyboard and Figma-ready output.</p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-800 text-white font-semibold shadow">Upload Screens</button>
            </div>

            <div className="mt-8 bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-100">Paste Notes</div>
                <div className="text-xs text-gray-500">Paste raw text or messy notes</div>
              </div>

              <div className="relative mt-4">
                <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} id="pasteNotes" placeholder="Paste messy notes, raw text, or project thoughts here..." className="w-full h-40 bg-gray-800 border border-gray-700 rounded-md p-3 text-sm text-gray-100 focus:ring-gray-500 focus:border-gray-500"></textarea>
              </div>

              {/* Buttons row: primary Send & Process is placed to the extreme right */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-500">{status}</span>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={handleClear} className="px-4 py-2 rounded-md bg-transparent border border-gray-700 text-sm text-gray-300">Clear</button>
                  <button onClick={handleSend} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm">Send &amp; Process</button>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500">Notes will be processed when you click <strong>Send &amp; Process</strong>.</div>
            </div>
          </div>

          <div className="mt-12 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-8 h-8 rounded-full bg-gray-800 text-gray-100 flex items-center justify-center font-semibold">1</div><div>Inputs</div></div>
              <div className="text-sm text-gray-600">→</div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-8 h-8 rounded-full bg-gray-800 text-gray-100 flex items-center justify-center font-semibold">2</div><div>Analysis</div></div>
              <div className="text-sm text-gray-600">→</div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-8 h-8 rounded-full bg-gray-800 text-gray-100 flex items-center justify-center font-semibold">3</div><div>Editor</div></div>
              <div className="text-sm text-gray-600">→</div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-8 h-8 rounded-full bg-gray-800 text-gray-100 flex items-center justify-center font-semibold">4</div><div>Export</div></div>
            </div>

            <section id="inputs" className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
              <div className="flex items-start justify-between gap-6">
                <div><h3 className="text-xl font-semibold">1. Inputs</h3><p className="text-sm text-gray-400 mt-2">Drag & drop your app screens, paste notes, or add audio. We accept PNG/JPG and transcripts. This step gathers the raw materials.</p></div>
                <div className="flex items-center gap-3"><button className="px-4 py-2 rounded-md bg-gray-700 text-white">Start Upload</button><a href="#" className="text-sm text-gray-500">Learn more</a></div>
              </div>
            </section>

            <section id="analysis" className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
              <div className="flex items-start justify-between gap-6"><div><h3 className="text-xl font-semibold">2. Analysis</h3><p className="text-sm text-gray-400 mt-2">Our agents extract UI hierarchy, detect problems, and build a story skeleton. You can review and answer clarifier questions if needed. This is automated with opt-in clarifiers.</p></div><div className="flex items-center gap-3"><button className="px-4 py-2 rounded-md bg-gray-700 text-white">Run Analysis</button><a href="#" className="text-sm text-gray-500">Learn more</a></div></div>
            </section>

            <section id="editor" className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
              <div className="flex items-start justify-between gap-6"><div><h3 className="text-xl font-semibold">3. Editor</h3><p className="text-sm text-gray-400 mt-2">Refine the AI draft in a two-column editor: outline on the left, editable narrative on the right. Control tone, length, and exports. Accept AI suggestions or modify freely.</p></div><div className="flex items-center gap-3"><button className="px-4 py-2 rounded-md bg-gray-700 text-white">Open Editor</button><a href="#" className="text-sm text-gray-500">Learn more</a></div></div>
            </section>

            <section id="export" className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
              <div className="flex items-start justify-between gap-6"><div><h3 className="text-xl font-semibold">4. Export</h3><p className="text-sm text-gray-400 mt-2">Export as PDF, HTML, slides, or Figma layers. Share a public portfolio link or download a zip for your site. Choose recruiter-friendly short versions.</p></div><div className="flex items-center gap-3"><button className="px-4 py-2 rounded-md bg-gray-700 text-white">Export</button><a href="#" className="text-sm text-gray-500">Learn more</a></div></div>
            </section>
          </div>
        </section>
      </main>

      <footer className="mt-24 bg-gray-900 border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-6 text-sm text-gray-500 flex justify-between"><div>© {new Date().getFullYear()} Design Narrator — Built for interviews & portfolios</div><div className="flex gap-4"><a className="hover:underline">Privacy</a><a className="hover:underline">Terms</a></div></div>
      </footer>
    </div>
  );
}

// -------------------------
// EditorScreen — consumes shared context and matches Apple-style minimal black theme
function EditorScreen() {
  const { blocks = [], acceptBlock, updateBlock } = useAnalysisEditor();
  const [selectedId, setSelectedId] = useState(blocks[0]?.id || null);
  const [drafts, setDrafts] = useState(() => Object.fromEntries((blocks||[]).map(b=>[b.id, b.extractedText || ''])));

  // keep drafts in sync when blocks change
  React.useEffect(()=>{
    setDrafts(Object.fromEntries((blocks||[]).map(b=>[b.id, b.extractedText || ''])));
    if(!selectedId && blocks[0]) setSelectedId(blocks[0].id);
  },[blocks]);

  function updateDraft(id, text){
    setDrafts(d=>({...d,[id]:text}));
    updateBlock(id, { extractedText: text });
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Editor — Refine AI draft</h2>
          <div className="text-sm text-gray-400">Two-column editor — accept blocks to include in final case study</div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-4 bg-gray-900 p-4 rounded-lg border border-gray-800 h-[60vh] overflow-auto">
            <div className="text-sm font-medium mb-3">Outline</div>
            <div className="space-y-3">
              {(blocks||[]).map(b=> (
                <div key={b.id} className={`p-3 rounded ${selectedId===b.id? 'ring-2 ring-gray-700 bg-gray-800':'bg-black border border-gray-800'}`}>
                  <div className="flex justify-between">
                    <div onClick={()=>setSelectedId(b.id)} className="cursor-pointer">
                      <div className="text-xs text-gray-400">{b.type}</div>
                      <div className="font-medium mt-1">{b.title}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{b.extractedText}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={()=>acceptBlock(b.id)} className="px-2 py-1 rounded bg-white text-black text-xs">Accept</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="col-span-8 bg-gray-900 p-4 rounded-lg border border-gray-800 h-[60vh] flex flex-col">
            {selectedId ? (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-gray-400">Editing</div>
                    <div className="text-lg font-semibold">{(blocks.find(b=>b.id===selectedId)||{}).title}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>acceptBlock(selectedId)} className="px-3 py-2 bg-white text-black rounded text-sm">Accept block</button>
                  </div>
                </div>

                <textarea value={drafts[selectedId]||''} onChange={(e)=>updateDraft(selectedId,e.target.value)} className="flex-1 w-full p-4 rounded border border-gray-800 bg-black text-white resize-none" />

                <div className="mt-3 text-xs text-gray-400">All edits are local — wire a backend to persist.</div>
              </>
            ) : (
              <div className="text-gray-500">No block selected.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// -------------------------
// Wrapper: provide AnalysisEditor context to the Landing component and expose EditorScreen for preview.
export default function AppWrapped() {
  return (
    <AnalysisEditorProvider>
      <InnerApp />
    </AnalysisEditorProvider>
  );
}

function InnerApp(){
  const { view = 'landing' } = useAnalysisEditor();
  if(view === 'editor') return <EditorScreen />;
  return <DesignNarratorLanding />;
}
