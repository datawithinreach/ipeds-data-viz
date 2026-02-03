import { NextResponse } from 'next/server';
import type { Message, ApiResponse } from '@/types';

const messages: Message[] = [{ id: '1', text: 'Hello World!' }];

// GET /api
export async function GET(): Promise<NextResponse<ApiResponse<Message[]>>> {
  return NextResponse.json({ data: messages });
}

// POST /api
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Message>>> {
  const body = await request.json();

  const newMessage: Message = {
    id: crypto.randomUUID(),
    text: body.text,
  };

  messages.push(newMessage);

  return NextResponse.json({ data: newMessage }, { status: 201 });
}
