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
        className="mx-auto mt-20 max-w-4xl bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 backdrop-blur-sm outline-none"
        overlayClassName="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"
        shouldCloseOnOverlayClick={true}
      >
        <h2 className="text-3xl font-bold mb-4 text-center text-white">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white bg-blue-100/10"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white bg-blue-100/10"
            />
          </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-6 w-full max-w-md flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full max-w-md flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => signIn('linkedin')}
            className="w-full max-w-md flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none"
          >
            LinkedIn
          </button>
        </div>
      </form>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleRegisterClick}
            className="w-full max-w-md flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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