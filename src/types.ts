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
