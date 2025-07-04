"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import type { Todo } from "@/types";
import Image from "next/image";
import { DeleteDialog, ToggleButton, EditDialog } from "@/helpers";
import {
  handleDelete,
  handleToggleComplete,
  handleUpdateTodo,
} from "@/server-actions";
import { toast } from "sonner";

export const TodoListItem = ({
  id,
  todo,
  photo_url,
  completed: initialCompleted,
}: Todo) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] =
    useState(initialCompleted);

  useEffect(() => {
    setOptimisticCompleted(initialCompleted);
  }, [initialCompleted]);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await handleDelete(id);
      if (result.type === "success") {
        toast.success(result.message);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const onToggle = async (id: number, completed: boolean) => {
    setOptimisticCompleted(completed);

    const result = await handleToggleComplete(id, completed);
    if (result.type === "success") {
      toast.success(result.message);
    } else {
      setOptimisticCompleted(!completed);
      toast.error(result.message);
    }
    return result;
  };

  const onEdit = async (formData: FormData) => {
    try {
      const result = await handleUpdateTodo(
        id,
        formData.get("todo") as string,
        formData.get("photo_url") as string
      );
      if (result.type === "success") {
        toast.success(result.message);
        setIsEditDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update todo");
    }
  };

  return (
    <div className="flex items-center gap-4 w-full border border-gray-200 rounded-lg px-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="item-1"
          className={optimisticCompleted ? "opacity-50" : ""}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-h-[48px]">
              {/* complete button */}
              <ToggleButton
                completed={optimisticCompleted}
                id={id}
                onToggle={onToggle}
              />
              <AccordionTrigger
                className={`flex-1 text-left break-words flex items-center hover:no-underline hover:decoration-none [&[data-state=open]]:no-underline py-2 ${
                  optimisticCompleted ? "line-through" : ""
                }`}
              >
                {todo}
              </AccordionTrigger>
            </div>
            <div className="flex items-center gap-4 ml-4 shrink-0">
              {/* edit button */}
              <EditDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onEdit={onEdit}
                initialTodo={todo}
                initialPhotoUrl={photo_url}
              />

              {/* delete button */}
              <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            </div>
          </div>
          <AccordionContent>
            {photo_url && photo_url !== "No photo attached" ? (
              <div className="py-2 relative w-full aspect-[16/9]">
                <Image
                  src={photo_url}
                  alt={`Todo item: ${todo}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://placehold.co/400x300?text=Image+Not+Found";
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500 italic py-2">No photo attached</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
