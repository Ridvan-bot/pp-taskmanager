import Header from "./components/header";
import Footer from "./components/footer";
import ChangeName from "./components/changeName";

export default function Home() {
  return (
    <>
      <Header />
      <div className="grid grid-rows-[1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
          <ChangeName />
        </main>
      </div>
      <Footer />
    </>
  );
}