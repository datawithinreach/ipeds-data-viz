'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message, ApiResponse } from '@/types';

export default function Home() {
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: async (): Promise<Message[]> => {
      const res = await fetch('/api');
      const json: ApiResponse<Message[]> = await res.json();
      return json.data ?? [];
    },
  });

  const { mutate: addMessage } = useMutation({
    mutationFn: async (): Promise<Message> => {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'New message' }),
      });
      const json: ApiResponse<Message> = await res.json();
      return json.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Hello World</h1>

      <div>
        {messages.map((msg) => (
          <p key={msg.id}>{msg.text}</p>
        ))}
      </div>

      <button
        onClick={() => addMessage()}
        className="rounded bg-zinc-900 px-4 py-2 text-white"
      >
        Add Message (POST)
      </button>
    </main>
  );
}
