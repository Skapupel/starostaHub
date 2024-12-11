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
    const [editing, setEditing] = useState(false);

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
                const data = response.data.data;
                setProfileData(data);
                setEditing(false);
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
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
                <div className="flex-grow flex items-center justify-center">
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
                <footer className="p-4 text-center text-sm text-gray-500 bg-gray-900">
                    © {new Date().getFullYear()} StarostaHub
                </footer>
            </div>
        );
    }

    const { email, full_name, role } = profileData;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
            <div className="flex-grow">
                {/* Hero Section */}
                <div className="relative w-full h-64 flex flex-col justify-center items-center text-white bg-gray-800">
                    <h1 className="text-4xl font-extrabold">
                        {full_name || "Профіль користувача"}
                    </h1>
                    {role && (
                        <div className="mt-2 font-semibold text-gray-200 text-sm">
                            Роль: {role}
                        </div>
                    )}
                    <button
                        onClick={() => setEditing(!editing)}
                        className="mt-4 px-4 py-2 text-sm bg-blue-900 rounded-lg font-bold hover:bg-blue-950 focus:ring-4 focus:ring-blue-500 focus:outline-none"
                    >
                        {editing ? "Скасувати" : "Редагувати профіль"}
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center px-4 py-10">
                    {/* Editable Form (Shown if editing) */}
                    {editing && (
                        <form
                            onSubmit={handleSubmit}
                            className="bg-black/50 p-6 rounded-lg w-full max-w-lg space-y-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-center">Оновити профіль</h2>
                            {error && (
                                <div className="bg-red-700/80 text-white px-4 py-2 rounded-lg mb-4 text-center font-semibold">
                                    {error}
                                </div>
                            )}
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
                        </form>
                    )}

                    {/* Info Section */}
                    {!editing && (
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                            <div className="bg-black/20 p-6 rounded-lg border border-white/10">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Повне ім'я
                                </label>
                                <div className="text-white font-semibold">
                                    {full_name}
                                </div>
                            </div>

                            <div className="bg-black/20 p-6 rounded-lg border border-white/10">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Електронна адреса
                                </label>
                                <div className="text-white font-semibold">
                                    {email}
                                </div>
                            </div>

                            <div className="bg-black/20 p-6 rounded-lg border border-white/10">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Ім'я користувача
                                </label>
                                <div className="text-white font-semibold">
                                    {username}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Back to Home Button */}
                    <div className="mt-8">
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-gray-400 hover:text-gray-300 transition"
                        >
                            Назад на головну
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="p-4 text-center text-sm text-gray-500 bg-gray-900">
                © {new Date().getFullYear()} StarostaHub
            </footer>
        </div>
    );
}
