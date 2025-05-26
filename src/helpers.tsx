"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  MdOutlineDelete,
  MdCheckBoxOutlineBlank,
  MdCheckBox,
} from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import type { ServerFeedback } from "@/types";

export function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button
      type="submit"
      size="icon"
      className="rounded-full w-10 h-10"
      disabled={isPending}
    >
      {isPending ? "..." : "+"}
    </Button>
  );
}

export function ToggleButton({
  completed,
  id,
  onToggle,
}: {
  completed: boolean;
  id: number;
  onToggle: (id: number, completed: boolean) => Promise<ServerFeedback>;
}) {
  const [, action, isPending] = useActionState(
    async (state: ServerFeedback, formData: FormData) => {
      const result = await onToggle(
        Number(formData.get("id")),
        formData.get("completed") === "true"
      );
      return result;
    },
    { type: "", message: "" }
  );

  return (
    <form action={action} className="flex items-center">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="completed" value={(!completed).toString()} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className={`p-0 h-auto w-auto ${
          isPending ? "opacity-50 pointer-events-none" : ""
        }`}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin text-green-500 shrink-0" />
        ) : completed ? (
          <MdCheckBox className="w-5 h-5 text-green-500 hover:text-green-600 shrink-0" />
        ) : (
          <MdCheckBoxOutlineBlank className="w-5 h-5 hover:text-green-500 shrink-0" />
        )}
      </Button>
    </form>
  );
}

export function DeleteDialog({
  isOpen,
  onOpenChange,
  onDelete,
  isDeleting,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <MdOutlineDelete
          className={`w-5 h-5 cursor-pointer hover:text-red-500 ${
            isDeleting ? "opacity-50 pointer-events-none" : ""
          }`}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your todo
            item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EditDialog({
  isOpen,
  onOpenChange,
  onEdit,
  initialTodo,
  initialPhotoUrl,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (formData: FormData) => Promise<void>;
  initialTodo: string;
  initialPhotoUrl: string;
}) {
  const [todo, setTodo] = useState(initialTodo);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);

  const [, action, isPending] = useActionState(
    async (state: ServerFeedback, formData: FormData) => {
      await onEdit(formData);
      return { type: "success", message: "Todo updated successfully" };
    },
    { type: "", message: "" }
  );

  // Reset form values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTodo(initialTodo);
      setPhotoUrl(initialPhotoUrl);
    }
  }, [isOpen, initialTodo, initialPhotoUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <FaRegEdit
          className={`w-5 h-5 cursor-pointer hover:text-blue-500 ${
            isPending ? "opacity-50 pointer-events-none" : ""
          }`}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogDescription>
            Make changes to your todo item here.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="todo" className="text-sm font-medium">
              Todo Text
            </label>
            <Input
              id="todo"
              name="todo"
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              placeholder="Enter your todo"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="photo_url" className="text-sm font-medium">
              Image URL
            </label>
            <Input
              id="photo_url"
              name="photo_url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Enter image URL (optional)"
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
