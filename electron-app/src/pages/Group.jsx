import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function Group() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroupData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/user/groups/${id}`);
                if (response.status === 200 && response.data.data) {
                    setGroupData(response.data.data);
                } else {
                    setError("Не вдалося завантажити дані групи.");
                }
            } catch (err) {
                setError("Сталася помилка при завантаженні даних групи.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupData();
    }, [id]);

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

    const { name, starosta, students } = groupData;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300">
            <header className="bg-gray-800 shadow-md py-8 relative">
                <h1 className="text-4xl font-extrabold text-center text-white tracking-wide">
                    {name}
                </h1>
            </header>
            <main className="flex-grow p-8 max-w-4xl mx-auto space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Староста</h2>
                    {starosta ? (
                        <div className="bg-black/40 p-4 rounded-lg border border-gray-700 text-white space-y-2">
                            <div><span className="font-medium">Повне ім'я:</span> {starosta.full_name}</div>
                            <div><span className="font-medium">Електронна адреса:</span> {starosta.email}</div>
                            <div><span className="font-medium">Роль:</span> {starosta.role}</div>
                        </div>
                    ) : (
                        <div className="text-gray-400">Немає старости.</div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Студенти</h2>
                    {students && students.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {students.map((student) => (
                                <div key={student.id} className="bg-black/40 p-4 rounded-lg border border-gray-700 text-white space-y-1">
                                    <div><span className="font-medium">Повне ім'я:</span> {student.full_name}</div>
                                    <div><span className="font-medium">Електронна адреса:</span> {student.email}</div>
                                    <div><span className="font-medium">Роль:</span> {student.role}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Немає студентів.</div>
                    )}
                </section>
                <div className="pt-2 flex justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-gray-400 hover:text-gray-300 transition"
                    >
                        Назад на головну
                    </button>
                </div>
            </main>
            <footer className="p-4 text-center text-sm text-gray-500 bg-gray-900">
                © {new Date().getFullYear()} StarostaHub
            </footer>
        </div>
    );
}
