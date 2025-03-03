import React, { useState } from 'react';
import Image from 'next/image';
import { Customer, HeaderProps } from '../../types';
import LoginModal from './loginModal';
import RegisterModal from './registerModal';

const Header: React.FC<HeaderProps> = ({ setSelectedCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(event.target.value as Customer);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
      <div className="flex-grow flex justify-center select-customer">
        <select className="p-3 px-20" onChange={handleSelectChange} defaultValue="">
          <option value="" disabled hidden>Select customer</option>
          <option value="Aspia">Aspia</option>
          <option value="Lantmännen">Lantmännen</option>
          <option value="Kvadrat">Kvadrat</option>
        </select>
      </div>
      <div className="flex items-center">
        <button className="p-3 px-6 rounded-lg pohlman-button" onClick={openModal}>Login</button>
      </div>
      <LoginModal isOpen={isModalOpen} onRequestClose={closeModal} />
      <div className="flex items-center">
        <button className="ml-2 p-3 px-6 rounded-lg pohlman-button" onClick={openRegister}>Register</button>
      </div>
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={closeRegisterModal} />
    </header>
  );
};

export default Header;