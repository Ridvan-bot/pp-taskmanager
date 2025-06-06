'use client';
import { SessionProvider } from 'next-auth/react';
import Header from "./components/ui/header";
import Footer from "./components/ui/footer";
import WorkSpace from "./components/workSpace";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Home() {
  return (
    <SessionProvider session={null}>
          <DndProvider backend={HTML5Backend}>
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow grid grid-rows-[1fr_20px] items-center justify-items-center p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
          <WorkSpace />
        </main>
      </div>
      <Footer />
    </div>
    </DndProvider>
    </SessionProvider>
  );
}