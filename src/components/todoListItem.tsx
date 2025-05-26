"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { FaRegEdit } from "react-icons/fa";
import { useState } from "react";
import { handleDelete, handleToggleComplete } from "@/server-actions";
import type { Todo } from "@/types";

export const TodoListItem = ({ id, todo, photo_url, completed }: Todo) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const onDelete = async () => {
    await handleDelete(id);
    setIsDeleteDialogOpen(false);
  };

  const toggleComplete = async () => {
    await handleToggleComplete(id, !completed);
  };

  return (
    <div className="flex items-center gap-4 w-full border-1 border-black rounded-md my-4 px-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className={completed ? "opacity-50" : ""}>
          <div className="flex items-center justify-between">
            <AccordionTrigger
              className={`flex-1 text-left break-words min-h-[40px] flex items-center hover:no-underline hover:decoration-none [&[data-state=open]]:no-underline ${
                completed ? "line-through" : ""
              }`}
            >
              {todo}
            </AccordionTrigger>
            <div className="flex items-center gap-4 ml-4 shrink-0">
              <FaRegEdit className="w-5 h-5 cursor-pointer hover:text-blue-500" />
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <MdOutlineDelete className="w-5 h-5 cursor-pointer hover:text-red-500" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your todo item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <span className="w-0.5 h-10 bg-gray-300"></span>
              {completed ? (
                <MdCheckBox
                  className="w-5 h-5 cursor-pointer text-green-500 hover:text-green-600"
                  onClick={toggleComplete}
                />
              ) : (
                <MdCheckBoxOutlineBlank
                  className="w-5 h-5 cursor-pointer hover:text-green-500"
                  onClick={toggleComplete}
                />
              )}
            </div>
          </div>
          <AccordionContent>{photo_url}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
