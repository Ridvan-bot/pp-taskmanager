'use client';
import { SessionProvider } from 'next-auth/react';
import WorkSpace from "./components/workSpace";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Home() {
  return (
    <SessionProvider>
          <DndProvider backend={HTML5Backend}>
        <main className="
        flex flex-col 
        gap-8 
        row-start-1 
        items-center 
        justify-items-center 
        sm:items-start 
        font-[family-name:var(--font-geist-sans)]
        bg-slate-900">
          <WorkSpace />
        </main>
    </DndProvider>
    </SessionProvider>
  );
}