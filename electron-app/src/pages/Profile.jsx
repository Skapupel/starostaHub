import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Editable fields
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get("/api/user/profile");
                if (response.status === 200) {
                    const data = response.data.data;
                    setProfileData(data);
                    setUsername(data.username || "");
                    setFirstName(data.first_name || "");
                    setLastName(data.last_name || "");
                } else {
                    setError("Не вдалось завантажити профіль.");
                }
            } catch (err) {
                setError("Сталася помилка при завантаженні профілю.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await api.patch("/api/user/profile", {
                username,
                first_name: firstName,
                last_name: lastName,
            });
            if (response.status === 200) {
                // Refresh the profile data after successful update
                const data = response.data.data;
                setProfileData(data);
            } else {
                setError("Не вдалося оновити профіль.");
            }
        } catch (err) {
            setError("Сталася помилка при оновленні профілю.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
                <div className="text-xl font-bold animate-pulse">Завантаження...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
                <div className="text-center space-y-4">
                    <div className="text-2xl font-bold">Помилка</div>
                    <div>{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none"
                    >
                        Спробувати знову
                    </button>
                    <div className="pt-2 flex justify-center">
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-gray-400 hover:text-gray-300 transition"
                        >
                            Назад на головну
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { email, full_name, role } = profileData;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <div
                className="w-full max-w-2xl p-8 md:p-16 rounded-3xl shadow-2xl"
                style={{
                    background: "rgba(20, 20, 30, 0.7)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                <h1 className="text-4xl font-extrabold text-center text-white mb-10 tracking-wide">
                    Профіль
                </h1>

                {error && (
                    <div className="bg-red-700/80 text-white px-4 py-2 rounded-lg mb-6 text-center font-semibold">
                        {error}
                    </div>
                )}

                {/* Editable fields at the top */}
                <form onSubmit={handleSubmit} className="space-y-6 mb-12">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Ім'я користувача
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Оновити username"
                        />
                    </div>
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                            Ім'я
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Оновити ім'я"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                            Прізвище
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/50 text-white placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-black/60 transition"
                            placeholder="Оновити прізвище"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 font-bold text-white rounded-lg relative overflow-hidden group transition"
                        style={{
                            background: "linear-gradient(90deg, #3B82F6, #2563EB)",
                        }}
                    >
                        <span className="relative z-10">Зберегти</span>
                        <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                                boxShadow:
                                    "0 0 15px rgba(37,99,235,0.7), 0 0 30px rgba(59,130,246,0.5)",
                            }}
                        ></div>
                    </button>
                    <div className="pt-2 flex justify-center">
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-gray-400 hover:text-gray-300 transition"
                        >
                            Назад на головну
                        </button>
                    </div>
                </form>

                {/* Divider line */}
                <hr className="border-gray-700 mb-12"/>

                {/* Read-only fields with distinct style */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Повне ім'я
                        </label>
                        <div className="text-white font-semibold bg-black/20 p-3 rounded-lg border border-transparent cursor-not-allowed">
                            {full_name}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Електронна адреса
                        </label>
                        <div className="text-white font-semibold bg-black/20 p-3 rounded-lg border border-transparent cursor-not-allowed">
                            {email}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Роль
                        </label>
                        <div className="text-white font-semibold bg-black/20 p-3 rounded-lg border border-transparent cursor-not-allowed">
                            {role}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
