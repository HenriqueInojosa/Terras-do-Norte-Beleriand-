'use client';

import Dagre from '@dagrejs/dagre';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CharacterOverlay } from '@/components/characters/CharacterOverlay';
import { HexPortrait } from '@/components/ui/HexPortrait';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import type { RelationshipType } from '@/lib/types';
import { RELATION_LABEL, TYPE_LABEL, type World } from '@/lib/world';

type Kind = RelationshipType | 'familia';

const STYLE: Record<Kind, { stroke: string; dash?: string; width: number; label: string }> = {
  governa: { stroke: '#d1b16a', width: 2, label: 'Governa' },
  'vassalo-de': { stroke: '#c0643a', dash: '7 5', width: 1.6, label: 'Vassalagem' },
  'reconhece-rei': { stroke: '#c0643a', dash: '2 4', width: 1.6, label: 'Reconhece como Alto Rei' },
  alianca: { stroke: '#7fa6c2', width: 1.6, label: 'Aliança' },
  amizade: { stroke: '#8fae78', dash: '1 5', width: 2, label: 'Amizade' },
  familia: { stroke: '#6f6353', width: 1, label: 'Família (pai ou mãe de)' },
};

function CharacterNode({ data }: NodeProps) {
  const d = data as { world: World; id: string; dim: boolean };
  const c = d.world.characters.get(d.id)!;
  return (
    <div className="flex w-[120px] flex-col items-center transition-opacity duration-300" style={{ opacity: d.dim ? 0.3 : 1 }}>
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <HexPortrait world={d.world} character={c} width={58} />
      <span className="mt-1 text-center font-display text-[0.95rem] leading-tight text-fg">{c.nome}</span>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}

function TerritoryNode({ data }: NodeProps) {
  const d = data as { world: World; id: string; dim: boolean };
  const t = d.world.territories.get(d.id as never)!;
  return (
    <div className="parchment rounded-lg px-4 py-2 text-center transition-opacity duration-300" style={{ opacity: d.dim ? 0.3 : 1 }}>
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <div className="font-caps text-[0.55rem] text-parch-muted">{t.velado ? 'Oculto' : TYPE_LABEL[t.tipo]}</div>
      <div className="font-display text-[1.1rem] leading-tight">{t.nome}</div>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { character: CharacterNode, territory: TerritoryNode };

export function RelationsGraph() {
  const world = useWorld();
  const router = useRouter();
  const [show, setShow] = useState<Record<Kind, boolean>>({
    governa: true,
    'vassalo-de': true,
    'reconhece-rei': true,
    alianca: true,
    amizade: true,
    familia: false,
  });
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const raw: { id: string; kind: Kind; source: string; target: string; title: string }[] = [];
    for (const r of world.relationships) {
      if (!show[r.tipo]) continue;
      raw.push({
        id: r.id,
        kind: r.tipo,
        source: `${r.de.kind}:${r.de.id}`,
        target: `${r.para.kind}:${r.para.id}`,
        title: RELATION_LABEL[r.tipo],
      });
    }
    const involved = new Set(raw.flatMap((e) => [e.source, e.target]));
    if (show.familia) {
      for (const c of world.characters.values()) {
        if (!involved.has(`character:${c.id}`)) continue;
        for (const p of c.pais) {
          if (involved.has(`character:${p.valor}`))
            raw.push({ id: `fam-${p.valor}-${c.id}`, kind: 'familia', source: `character:${p.valor}`, target: `character:${c.id}`, title: 'pai/mãe de' });
        }
      }
    }
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 26, ranksep: 120, marginx: 20, marginy: 20 });
    for (const id of involved) g.setNode(id, { width: id.startsWith('territory') ? 150 : 124, height: id.startsWith('territory') ? 56 : 100 });
    for (const e of raw) g.setEdge(e.source, e.target);
    Dagre.layout(g);

    const neighbours = new Set<string>();
    if (hover) {
      neighbours.add(hover);
      raw.forEach((e) => {
        if (e.source === hover) neighbours.add(e.target);
        if (e.target === hover) neighbours.add(e.source);
      });
    }
    const nodes: Node[] = [...involved].map((id) => {
      const n = g.node(id);
      const [kind, eid] = id.split(':');
      return {
        id,
        type: kind,
        position: { x: n.x - n.width / 2, y: n.y - n.height / 2 },
        data: { world, id: eid, dim: !!hover && !neighbours.has(id) },
      };
    });
    const edges: Edge[] = raw.map((e) => {
      const st = STYLE[e.kind];
      const on = !hover || e.source === hover || e.target === hover;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        label: on && hover ? e.title : undefined,
        labelStyle: { fill: '#eadfc6', fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 13 },
        labelBgStyle: { fill: '#14110e', fillOpacity: 0.85 },
        style: { stroke: st.stroke, strokeWidth: st.width, strokeDasharray: st.dash, opacity: on ? 1 : 0.12, transition: 'opacity .3s' },
        markerEnd: { type: MarkerType.ArrowClosed, color: st.stroke, width: 14, height: 14 },
      };
    });
    return { nodes, edges };
  }, [world, show, hover]);

  return (
    <div className="relative h-[calc(100dvh-var(--header-h))]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2.2}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeMouseEnter={(_, n) => setHover(n.id)}
        onNodeMouseLeave={() => setHover(null)}
        onNodeClick={(_, n) => {
          const [kind, id] = n.id.split(':');
          if (kind === 'character') setOpen(id);
          else router.push(`/?r=${id}`);
        }}
        className="relations-flow"
      >
        <Background color="#3d342a" gap={28} size={1} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="panel absolute right-4 top-4 w-64 rounded-2xl p-4"
      >
        <p className="font-caps text-[0.62rem] text-gold-400">Relações políticas</p>
        <p className="mb-3 font-display text-[0.95rem] italic leading-snug text-muted">Quem governa o quê e quem serve a quem, até o seu capítulo.</p>
        <ul className="space-y-1.5">
          {(Object.keys(STYLE) as Kind[]).map((k) => (
            <li key={k}>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} className="accent-[#b8923f]" />
                <svg width="34" height="8">
                  <line x1="0" y1="4" x2="34" y2="4" stroke={STYLE[k].stroke} strokeWidth={STYLE[k].width} strokeDasharray={STYLE[k].dash} />
                </svg>
                <span className="font-display text-[0.98rem]">{STYLE[k].label}</span>
              </label>
            </li>
          ))}
        </ul>
      </motion.div>

      <CharacterOverlay id={open} onClose={() => setOpen(null)} onPick={setOpen} onTerritory={(id) => router.push(`/?r=${id}`)} />
    </div>
  );
}
