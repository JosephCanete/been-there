// This file explicitly prevents NextAuth from being imported or executed
// Added to resolve Vercel deployment issues with cached NextAuth code

export default function handler() {
  return new Response("NextAuth has been removed. This project uses Firebase Auth.", {
    status: 410, // Gone
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export const GET = handler;
export const POST = handler;
