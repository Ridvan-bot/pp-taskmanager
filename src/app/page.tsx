'use client';
import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import WorkSpace from "./components/workSpace";
import { Customer } from '../types/index';

export default function Home() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>('');

  return (
    <div className="flex flex-col min-h-screen">
      <Header setSelectedCustomer={setSelectedCustomer} />
      <div className="flex-grow grid grid-rows-[1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
          <WorkSpace selectedCustomer={selectedCustomer}/>
        </main>
      </div>
      <Footer />
    </div>
  );
}