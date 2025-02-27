import React from 'react';
import Image from 'next/image';
import { Customer, HeaderProps } from '../../types/index';



const Header: React.FC<HeaderProps> = ({ setSelectedCustomer }) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(event.target.value as Customer);
  };
  
  return (
    <header className="w-full p-4 text-white flex">
      <div className="flex items-center">
        <Image src="/pohlmanproteanab.png" alt="Logo" width={40} height={40} />
        <h1 className="text-s ml-4">Pohlman Protean Task Manager</h1>
      </div>
      <div className="flex-grow flex justify-center select-customer ">
        <select className="p-3 px-20" onChange={handleSelectChange} >
        <option value="" disabled selected hidden>Select customer</option>
          <option value="Aspia">Aspia</option>
          <option value="Lantmännen">Lantmännen</option>
          <option value="Kvadrat">Kvadrat</option>
        </select>
      </div>
      <div className="flex items-center">
        <button className="p-3 px-6 rounded-lg pohlman-button">Login</button>
      </div>
    </header>
  );
};

export default Header;