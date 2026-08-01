"use client";

import { useEffect, useState, useTransition } from "react";
import { NotebookPen, Trash2, Loader2, Plus } from "lucide-react";

import { formatTimecode } from "@/lib/utils";
import { addNote, deleteNote, getNotes } from "@/app/(app)/actions";

type Note = {
  id: string;
  content: string;
  timestampSeconds: number;
  createdAt: Date;
};

export function NotesPanel({ lessonId }: { lessonId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getNotes(lessonId).then((rows) => {
      if (active) {
        setNotes(rows as Note[]);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [lessonId]);

  const onAdd = () => {
    const text = content.trim();
    if (!text) return;

    // Ancora a nota no ponto atual do vídeo.
    const video = document.querySelector("video");
    const at = video ? Math.floor(video.currentTime) : 0;

    setContent("");
    startTransition(async () => {
      await addNote(lessonId, text, at);
      setNotes((await getNotes(lessonId)) as Note[]);
    });
  };

  const onDelete = (id: string) => {
    setNotes((n) => n.filter((note) => note.id !== id));
    startTransition(async () => {
      await deleteNote(id);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-1 p-4 ring-1 ring-white/[0.07]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onAdd();
          }}
          rows={3}
          placeholder="Escreva uma anotação sobre este momento da aula…"
          className="w-full resize-none bg-transparent text-[0.88rem] text-white outline-none placeholder:text-neutral-600"
        />
        <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] pt-3">
          <span className="font-mono text-[0.7rem] text-neutral-600">
            ⌘ + Enter para salvar
          </span>
          <button
            onClick={onAdd}
            disabled={!content.trim() || pending}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[0.8rem] font-medium text-white transition hover:bg-brand-bright disabled:pointer-events-none disabled:opacity-40"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Adicionar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-xl bg-surface-1 p-8 text-center ring-1 ring-white/[0.07]">
          <NotebookPen className="mx-auto h-8 w-8 text-neutral-600" />
          <p className="mt-3 text-[0.85rem] text-neutral-500">
            Você ainda não tem anotações nesta aula.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group flex items-start gap-3 rounded-xl bg-surface-1 p-4 ring-1 ring-white/[0.07] transition hover:ring-white/15"
            >
              <button
                onClick={() => {
                  const video = document.querySelector("video");
                  if (video) {
                    video.currentTime = note.timestampSeconds;
                    void video.play();
                  }
                }}
                className="shrink-0 rounded bg-brand/15 px-2 py-1 font-mono text-[0.72rem] text-brand transition hover:bg-brand/25"
              >
                {formatTimecode(note.timestampSeconds)}
              </button>

              <p className="min-w-0 flex-1 text-[0.86rem] leading-relaxed whitespace-pre-wrap text-neutral-300">
                {note.content}
              </p>

              <button
                onClick={() => onDelete(note.id)}
                aria-label="Excluir anotação"
                className="shrink-0 rounded p-1.5 text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:bg-brand/10 hover:text-brand"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
