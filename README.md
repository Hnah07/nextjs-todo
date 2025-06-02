# Todo App with Next.js Server Actions

This project is a school exercise designed to practice and demonstrate the use of Next.js Server Actions and the `useActionState` hook. It's a simple todo application that allows users to create, read, update, and delete todo items with optional photo attachments.

## Learning Objectives

- Practice implementing and using Server Actions in Next.js
- Understand and implement `useActionState` for handling form submissions
- Work with client-side state management
- Handle file uploads and image display
- Practice error handling and user feedback

## Features

- Create, read, update, and delete todo items
- Toggle todo completion status
- Attach photos to todo items
- Real-time feedback using toast notifications
- Responsive design with a modern UI
- Server-side data persistence

## Technical Stack

- Next.js 14 (App Router)
- TypeScript
- Server Actions
- Tailwind CSS
- Shadcn/ui components
- Sonner for toast notifications

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and configurations
- `/src/server-actions.ts` - Server Actions implementation
- `/src/types.ts` - TypeScript type definitions

## Key Learning Points

1. **Server Actions**: Implementation of server-side functions that can be called directly from client components
2. **useActionState**: Practice with form handling and state management using the useActionState hook
3. **Error Handling**: Implementation of proper error handling and user feedback
4. **Type Safety**: TypeScript implementation for better development experience
5. **UI/UX**: Modern UI implementation using Tailwind CSS and shadcn/ui

## Resources

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/api-reference/functions/server-actions)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
