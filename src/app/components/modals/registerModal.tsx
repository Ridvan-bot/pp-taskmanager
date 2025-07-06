import React, { useState } from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { RegisterModalProps } from '@/types';

Modal.setAppElement('#__next');

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onRequestClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful registration
        console.log('Account created successfully:', data);
        setIsSuccess(true);
        
        // Start countdown
        let timeLeft = 30;
        setCountdown(timeLeft);
        
        const timer = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(timer);
            // Reset states and redirect to login
            setIsSuccess(false);
            setName('');
            setEmail('');
            setPassword('');
            setError('');
            onRequestClose();
            window.location.reload();
          }
        }, 1000);
      } else {
        // Handle registration error
        setError(data.error);
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    handleCreateAccount(event);
  };

  const handleLoginClick = () => {
    onRequestClose();
    window.location.reload();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
              contentLabel="Registrerings Modal"
      className="mx-auto mt-20 w-[700px] max-w-[90vw] bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-12 backdrop-blur-sm outline-none"
      overlayClassName="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"
      shouldCloseOnOverlayClick={false}
          >
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 p-3 ">
            <Image 
              src="/pohlmanproteanab.png" 
              alt="Pohlman Protean AB Logo" 
              width={80} 
              height={80}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-center text-white">Registrera användare</h2>
        </div>
        
        {isSuccess ? (
          // Success message
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-green-400">Registrering lyckades!</h3>
              <p className="text-slate-400">Du kommer att omdirigeras till inloggningssidan om <span className="text-white font-semibold">{countdown}</span> sekunder...</p>
            </div>
            <div className="w-full max-w-md bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          // Registration form
          <>
        <div className="flex justify-center">
          <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Namn:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-white bg-blue-100/10"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">E-post:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-white bg-blue-100/10"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">Lösenord:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-white bg-blue-100/10"
              />
            </div>
      <div className="flex justify-center">
        <button
          type="submit"
          className="mt-6 w-full flex justify-center py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-md border border-green-300/30 shadow-xl hover:from-green-400/30 hover:to-emerald-400/30 hover:border-green-300/50 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-300/50 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
        >
          Registrera
        </button>
      </div>
      </form>
      </div>
      <div className="flex flex-col items-center mt-6">
        <p className="text-slate-300 text-sm mb-2">Har du redan ett konto?</p>
        <button
          onClick={handleLoginClick}
          className="w-full max-w-md flex justify-center py-3 px-6 rounded-xl text-sm font-semibold text-white bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 hover:border-white/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
        >
          Tillbaka till inloggning
        </button>
      </div>
        </>
        )}
    </Modal>
  );
};

export default RegisterModal;