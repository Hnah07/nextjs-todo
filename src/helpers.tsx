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
  MdOutlineDelete,
  MdCheckBoxOutlineBlank,
  MdCheckBox,
} from "react-icons/md";

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
  isPending,
}: {
  completed: boolean;
  isPending: boolean;
}) {
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      className={`p-0 h-auto w-auto ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
      disabled={isPending}
    >
      {completed ? (
        <MdCheckBox className="w-5 h-5 text-green-500 hover:text-green-600 shrink-0" />
      ) : (
        <MdCheckBoxOutlineBlank className="w-5 h-5 hover:text-green-500 shrink-0" />
      )}
    </Button>
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
