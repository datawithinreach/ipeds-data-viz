import { NextResponse } from 'next/server';

type Message = {
  id: string;
  text: string;
};

type ApiResponse<T> = {
  data: T;
};

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
