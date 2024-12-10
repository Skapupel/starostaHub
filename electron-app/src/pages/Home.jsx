import React from "react";
import { useNavigate } from "react-router-dom";

const tiles = [
    // { title: "Cube", route: "/cube", emoji: "📊" },
    { title: "Профіль", route: "/profile", emoji: "👤" },
    // { title: "Settings", route: "/settings", emoji: "⚙️" },
    // { title: "Reports", route: "/reports", emoji: "📑" },
    { title: "Вихід", route: "/logout", emoji: "🚪" },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300">
            <header className="bg-gray-800 shadow-md py-8">
                <h1 className="text-5xl font-extrabold text-center text-white tracking-wider">
                    Меню
                </h1>
            </header>
            <main className="flex-grow p-8">
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
