import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "../constants";
import api from "../api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/api/auth/login", { email, password });
            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.data.refresh);
                localStorage.setItem(USER_ID, response.data.data.id);
                navigate("/");
            }
        } catch (err) {
            setError("Невірна пошта або пароль.");
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden p-4">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl"
                 style={{
                     background: "rgba(20, 20, 30, 0.7)",
                     backdropFilter: "blur(20px)",
                     WebkitBackdropFilter: "blur(20px)",
                     border: "1px solid rgba(255,255,255,0.1)",
                 }}
            >
                <h1 className="text-4xl font-extrabold text-center text-white mb-10 tracking-wide">
                    Вхід
                </h1>

                {error && (
                    <div className="bg-red-700/80 text-white px-4 py-2 rounded-lg mb-6 text-center font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Електронна адреса
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Введіть електронну адресу"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Введіть пароль"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 font-bold text-white rounded-lg relative overflow-hidden group transition"
                        style={{
                            background: "linear-gradient(90deg, #3B82F6, #2563EB)",
                        }}
                    >
                        <span className="relative z-10">Увійти</span>
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{
                                 boxShadow: "0 0 15px rgba(37,99,235,0.7), 0 0 30px rgba(59,130,246,0.5)"
                             }}
                        ></div>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Не маєте акаунту?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-blue-400 font-semibold hover:text-blue-300 transition underline"
                    >
                        Зареєструватися
                    </button>
                </p>
            </div>
        </div>
    );
}
