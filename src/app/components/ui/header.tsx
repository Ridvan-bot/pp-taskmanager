import React, { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import LoginModal from "../modals/loginModal";
import RegisterModal from "../modals/registerModal";

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status;

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterOpen(false);
  };

  return (
    <header className="w-full p-4 text-white flex">
      <div className="flex items-center">
        <Image src="/pohlmanproteanab.png" alt="Logo" width={40} height={40} />
        <h1 className="text-s ml-4">Pohlman Protean Task Manager</h1>
      </div>
      {status === "authenticated" ? (
        <div className="flex items-center ml-auto">
          <span className="mr-4">Welcome, {session?.user?.name}</span>
          <button
            className="p-3 px-6 rounded-lg pohlman-button"
            onClick={() => signOut()}
          >
            Logga ut
          </button>
        </div>
      ) : (
        <div className="flex items-center ml-auto space-x-4"></div>
      )}
      <LoginModal isOpen={isModalOpen} onRequestClose={closeModal} />
      <RegisterModal
        isOpen={isRegisterOpen}
        onRequestClose={closeRegisterModal}
      />
    </header>
  );
};

export default Header;
