import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { USER_ID } from "../constants";
import api from "../api";

export default function Group() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [availableStudents, setAvailableStudents] = useState([]);
    const [isAddingStudents, setIsAddingStudents] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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

    const fetchAvailableStudents = async () => {
        try {
            const response = await api.get(`/api/user/available-students`);
            if (response.status === 200 && Array.isArray(response.data.data)) {
                setAvailableStudents(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching available students:", err);
        }
    };

    const handleAddStudentsClick = async () => {
        await fetchAvailableStudents();
        setIsAddingStudents(true);
    };

    const handleStudentSelection = (studentId) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId]);
        }
    };

    const handleAddStudentsSubmit = async () => {
        setSubmitting(true);
        try {
            const existingStudentIds = groupData.students ? groupData.students.map(s => s.id) : [];
            const updatedStudentIds = [...new Set([...existingStudentIds, ...selectedStudentIds])];

            const patchData = {
                students: updatedStudentIds
            };

            const response = await api.patch(`/api/user/groups/${id}`, patchData);
            if (response.status === 200 && response.data.data) {
                setGroupData(response.data.data);
                setIsAddingStudents(false);
                setSelectedStudentIds([]);
            }
        } catch (err) {
            console.error("Error updating group students:", err);
        } finally {
            setSubmitting(false);
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

    const { name, starosta, students } = groupData || {};
    const currentUserId = localStorage.getItem(USER_ID);
    const isStarosta = starosta && starosta.id && parseInt(starosta.id) === parseInt(currentUserId);

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

                {isStarosta && !isAddingStudents && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleAddStudentsClick}
                            className="px-4 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none text-white"
                        >
                            Додати студентів
                        </button>
                    </div>
                )}

                {isStarosta && isAddingStudents && (
                    <div className="bg-black/50 p-4 rounded border border-gray-700 text-white space-y-4 mt-4">
                        <h3 className="text-xl font-bold">Оберіть студентів для додавання</h3>
                        {availableStudents.length > 0 ? (
                            <div className="flex flex-col space-y-2">
                                {availableStudents.map((st) => (
                                    <label key={st.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.includes(st.id)}
                                            onChange={() => handleStudentSelection(st.id)}
                                        />
                                        <span>{st.full_name} ({st.email})</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div>Немає доступних студентів для додавання.</div>
                        )}
                        <div className="flex space-x-2">
                            <button
                                disabled={submitting || selectedStudentIds.length === 0}
                                onClick={handleAddStudentsSubmit}
                                className="px-4 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:outline-none disabled:opacity-50"
                            >
                                Підтвердити
                            </button>
                            <button
                                disabled={submitting}
                                onClick={() => {
                                    setIsAddingStudents(false);
                                    setSelectedStudentIds([]);
                                }}
                                className="px-4 py-2 bg-gray-600 rounded-lg font-bold hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 focus:outline-none"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                )}

                <div className="pt-8 flex justify-center">
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
