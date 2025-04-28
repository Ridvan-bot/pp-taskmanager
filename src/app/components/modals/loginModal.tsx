import React, { useState } from 'react';
import Modal from 'react-modal';
import { signIn } from 'next-auth/react';
import { LoginModalProps } from '@/types';
import RegisterModal from './registerModal';

Modal.setAppElement('#__next');

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result && result.error) {
      setError(result.error);
    } else {
      onRequestClose();
    }
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
    onRequestClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Login Modal"
        className="modal"
        overlayClassName="modal-overlay"
        shouldCloseOnOverlayClick={false}
      >
          <style jsx>{`
    .modal {
      border: 2px solid #000;
      border-radius: 8px;
      padding: 1rem;
      /* andra stilar */
    }
  `}</style>
        <h2 className="text-3xl font-bold mb-4 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white-700">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white-700">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white bg-gray-700"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-10 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Login
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={handleRegisterClick}
            className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register
          </button>
        </div>
      </Modal>
      <RegisterModal isOpen={isRegisterModalOpen} onRequestClose={() => setIsRegisterModalOpen(false)} />
    </>
  );
};

export default LoginModal;