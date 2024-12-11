import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Home() {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Base tiles that always appear
    const baseTiles = [
        { title: "Розклад", route: "/events", emoji: "📅" },
        { title: "Профіль", route: "/profile", emoji: "👤" },
        { title: "Вихід", route: "/logout", emoji: "🚪" },
    ];

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get("/api/user/your-group");
                if (response.status === 200 && response.data.data) {
                    setGroup(response.data.data);
                } 
            } catch (err) {
                setError("Сталася помилка при завантаженні групи.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, []);

    // If loading, show a loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
                <div className="text-xl font-bold animate-pulse">Завантаження...</div>
            </div>
        );
    }

    // If error occurred, we won't show a group tile, just base tiles.
    // If no error and group is found, add the group tile
    const tiles = [...baseTiles];
    if (!error && group) {
        tiles.unshift({ title: group.name, route: `/group/${group.id}`, emoji: "🏫" });
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300">
            <header className="bg-gray-800 shadow-md py-8">
                <h1 className="text-5xl font-extrabold text-center text-white tracking-wider">
                    Меню
                </h1>
            </header>
            <main className="flex-grow p-8">
                {error && (
                    <div className="mb-6 text-center">
                        <div className="bg-red-700/80 text-white px-4 py-2 rounded-lg inline-block font-semibold">
                            {error}
                        </div>
                    </div>
                )}
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-7xl mx-auto">
                    {tiles.map((tile, index) => (
                        <button
                            key={index}
                            type="button"
                            className="flex flex-col items-center justify-center bg-gray-900 text-white p-8 rounded-2xl shadow-lg hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-800"
                            onClick={() => navigate(tile.route)}
                        >
                            <div className="text-4xl mb-4">{tile.emoji}</div>
                            <h2 className="text-2xl font-bold">{tile.title}</h2>
                        </button>
                    ))}
                </div>
            </main>
            <footer className="p-4 text-center text-sm text-gray-500 bg-gray-900">
                © {new Date().getFullYear()} StarostaHub
            </footer>
        </div>
    );
}
