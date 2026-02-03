// Shared types between frontend and backend

export type Message = {
  id: string;
  text: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
