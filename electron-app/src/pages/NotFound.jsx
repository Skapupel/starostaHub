import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden p-4">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-3xl"></div>

            <div
                className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl"
                style={{
                    background: "rgba(20, 20, 30, 0.7)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                <h2 className="text-xl font-bold text-center text-gray-300 mb-6">
                    Сторінку не знайдено
                </h2>
                <p className="text-sm text-gray-400 text-center mb-8">
                    На жаль, запитана сторінка недоступна. Можливо, вона була видалена.
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="py-3 px-6 font-bold text-white rounded-lg relative overflow-hidden group transition"
                        style={{
                            background: "linear-gradient(90deg, #3B82F6, #2563EB)",
                        }}
                    >
                        <span className="relative z-10">Повернутися на головну</span>
                        <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                                boxShadow:
                                    "0 0 15px rgba(37,99,235,0.7), 0 0 30px rgba(59,130,246,0.5)",
                            }}
                        ></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
