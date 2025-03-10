import React, { useState } from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import LoginModal from './loginModal';
import RegisterModal from './registerModal';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status;

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openRegister = () => {
    setIsRegisterOpen(true);
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
      {status === 'authenticated' ? (
        <div className="flex items-center ml-auto">
          <span className="mr-4">Welcome, {session?.user?.name}</span>
          <button className="p-3 px-6 rounded-lg pohlman-button" onClick={() => signOut()}>Logout</button>
        </div>
      ) : (
        <div className="flex items-center ml-auto">
          <button className="p-3 px-6 rounded-lg pohlman-button" onClick={openModal}>Login</button>
          <button className="ml-2 p-3 px-6 rounded-lg pohlman-button" onClick={openRegister}>Register</button>
        </div>
      )}
      <LoginModal isOpen={isModalOpen} onRequestClose={closeModal} />
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={closeRegisterModal} />
    </header>
  );
};

export default Header;