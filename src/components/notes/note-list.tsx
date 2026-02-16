"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toggleNotePin, deleteNote } from "@/lib/actions/notes";
import { formatDate } from "@/lib/utils";
import { CreateNoteDialog } from "./create-note-dialog";

interface NoteAuthor {
  name: string | null;
  email: string;
}

interface NoteItem {
  id: string;
  content: string;
  isPinned: boolean;
  author: NoteAuthor;
  createdAt: Date;
}

interface NoteListProps {
  notes: NoteItem[];
  entityType: "contact" | "company" | "deal";
  entityId: string;
}

export function NoteList({ notes, entityType, entityId }: NoteListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleTogglePin(id: string) {
    try {
      const result = await toggleNotePin(id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update note");
        return;
      }
      toast.success("Note updated");
    } catch {
      toast.error("Failed to update note");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteNote(deleteId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete note");
        return;
      }
      toast.success("Note deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  }

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateNoteDialog entityType={entityType} entityId={entityId} />
      </div>

      {sortedNotes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No notes yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {note.isPinned && (
                      <Badge variant="secondary" className="mb-2">
                        <Pin className="mr-1 h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {note.author.name ?? note.author.email} &middot;{" "}
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(note.id)}
                      title={note.isPinned ? "Unpin note" : "Pin note"}
                    >
                      {note.isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(note.id)}
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
