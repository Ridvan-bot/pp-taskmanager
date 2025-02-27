import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="w-full p-4 text-white flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center">
        <Image src="/pohlmanproteanab.png" alt="Logo" width={40} height={40} />
        <h1 className="text-s ml-4">Pohlman Protean Task Managerr</h1>
      </div>
      <nav>
        <ul className="flex space-x-4">
        </ul>
      </nav>
    </header>
  );
};

export default Header;