import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            const response = await api.post("/api/auth/register", {
                email,
                password,
                first_name: firstName,
                last_name: lastName,
            });

            if (response.status === 201) {
                navigate("/login");
            } else {
                setErrors(["Сталася невідома помилка. Спробуйте ще раз."]);
            }
        } catch (err) {
            const apiErrors = [];
            if (err.response && err.response.data) {
                // Check if we have structured errors 
                if (err.response.data.data?.errors && Array.isArray(err.response.data.data.errors)) {
                    err.response.data.data.errors.forEach((errorArr) => {
                        if (Array.isArray(errorArr)) {
                            errorArr.forEach((msg) => apiErrors.push(msg));
                        } else if (typeof errorArr === 'string') {
                            apiErrors.push(errorArr);
                        }
                    });
                } else if (err.response.data.message) {
                    apiErrors.push(err.response.data.message);
                } else {
                    apiErrors.push("Помилка реєстрації.");
                }
            } else {
                apiErrors.push("Помилка мережі або серверу. Спробуйте пізніше.");
            }

            setErrors(apiErrors);
        }
    };

    const dismissErrors = () => setErrors([]);

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
                    Реєстрація
                </h1>

                {errors.length > 0 && (
                    <div className="relative bg-red-700/90 text-white px-4 py-3 rounded-lg mb-6 font-semibold animate-fade-in">
                        <button
                            type="button"
                            onClick={dismissErrors}
                            className="absolute top-2 right-3 text-white hover:text-gray-200 font-bold text-xl leading-none"
                        >
                            &times;
                        </button>
                        <div className="text-center mb-2 font-bold">Виправте помилки нижче:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-left">
                            {errors.map((err, idx) => (
                                <li key={idx}>
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Пошта
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
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                            Ім'я
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Введіть ваше ім'я"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                            Прізвище
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Введіть ваше прізвище"
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
                        <span className="relative z-10">Зареєструватися</span>
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{
                                 boxShadow: "0 0 15px rgba(37,99,235,0.7), 0 0 30px rgba(59,130,246,0.5)"
                             }}
                        ></div>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Вже маєте акаунт?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-blue-400 font-semibold hover:text-blue-300 transition underline"
                    >
                        Увійти
                    </button>
                </p>
            </div>

            {/* Optional minimal CSS for fade-in animation */}
            <style jsx>{`
                @keyframes fade-in {
                    from {opacity: 0;}
                    to {opacity: 1;}
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
