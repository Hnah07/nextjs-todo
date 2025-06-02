import { RowDataPacket } from "mysql2";

export interface TodoDB extends RowDataPacket {
  id: number;
  todo: string;
  photo_url: string;
  completed: number;
}

export interface Todo {
  id: number;
  todo: string;
  photo_url: string;
  completed: boolean;
}

export interface ServerFeedback {
  type: string;
  message: string;
}
