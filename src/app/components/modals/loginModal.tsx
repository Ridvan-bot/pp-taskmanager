import React, { useState } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { LoginModalProps } from "@/types";
import RegisterModal from "./registerModal";

Modal.setAppElement("#__next");

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signIn("credentials", {
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
        contentLabel="Inloggnings Modal"
        className="mx-auto mt-20 w-[700px] max-w-[90vw] bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-12 backdrop-blur-sm outline-none"
        overlayClassName="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"
        shouldCloseOnOverlayClick={false}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 p-3">
            <Image
              src="/pohlmanproteanab.png"
              alt="Pohlman Protean AB Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-center text-white">
            Login
          </h2>
        </div>
        <div className="flex justify-center">
          <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email:
              </label>
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password:
              </label>
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
                className="mt-6 w-full flex justify-center py-3 px-6 rounded-xl text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 hover:border-white/30 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
              >
                Login
              </button>
            </div>
          </form>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleRegisterClick}
            className="w-full max-w-md flex justify-center py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-md border border-green-300/30 shadow-xl hover:from-green-400/30 hover:to-emerald-400/30 hover:border-green-300/50 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-300/50 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            Register
          </button>
        </div>
      </Modal>
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onRequestClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  );
};

export default LoginModal;
