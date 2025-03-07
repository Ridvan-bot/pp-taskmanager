import React, { useState } from 'react';
import Modal from 'react-modal';
import { signIn } from 'next-auth/react';
import { LoginModalProps } from '@/types';

Modal.setAppElement('#__next');

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2 className="text-2xl font-bold mb-4">Login</h2>
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="max-w-xs flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Login
          </button>
        </div>
      </form>
      <div className="flex justify-center mt-4">
        <button
          onClick={onRequestClose}
          className="max-w-xs flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default LoginModal;