import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { USER_ID } from "../constants";
import api from "../api";

export default function Events() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isStarosta, setIsStarosta] = useState(false);
    const [eventForm, setEventForm] = useState(null);
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null });

    const currentUserId = parseInt(localStorage.getItem(USER_ID), 10);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/user/groups/${id}/events`);
                if (response.status === 200) {
                    setEvents(response.data.data);
                } else {
                    setError("Не вдалося завантажити розклад.");
                }
            } catch (err) {
                setError("Сталася помилка при завантаженні розкладу.");
            } finally {
                setLoading(false);
            }
        };

        const fetchGroup = async () => {
            try {
                const response = await api.get(`/api/user/groups/${id}`);
                if (response.status === 200) {
                    const groupData = response.data.data;
                    if (groupData.starosta && parseInt(groupData.starosta.id, 10) === currentUserId) {
                        setIsStarosta(true);
                    }
                }
            } catch (err) {
                console.error("Помилка завантаження даних групи:", err);
            }
        };

        fetchEvents();
        fetchGroup();
    }, [id, currentUserId]);

    const handleCreateEvent = () => {
        setEventForm({
            id: null,
            name: "",
            url: "",
            date: "",
            time: "",
            weekday: "",
            recurring: false,
            recurring_until: "",
            is_active: true,
            group: id,
        });
    };

    const handleEditEvent = (event) => {
        setEventForm(event);
    };

    const handleDeleteEvent = (eventId) => {
        setDeleteModal({ isOpen: true, eventId });
    };

    const confirmDeleteEvent = async () => {
        try {
            setSubmitting(true);
            await api.delete(`/api/user/groups/${id}/events/${deleteModal.eventId}`);
            setEvents(events.filter((event) => event.id !== deleteModal.eventId));
        } catch (err) {
            console.error("Помилка видалення події:", err);
        } finally {
            setSubmitting(false);
            setDeleteModal({ isOpen: false, eventId: null });
            window.location.reload();
        }
    };

    const formatDateToApi = (date) => {
        const parsedDate = new Date(date);
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleSubmitEvent = async () => {
        setSubmitting(true);
        setFormError(null);
        try {
            const formattedEvent = {
                ...eventForm,
                date: formatDateToApi(eventForm.date),
                recurring_until: eventForm.recurring && eventForm.recurring_until
                    ? formatDateToApi(eventForm.recurring_until)
                    : null,
            };

            if (eventForm.id) {
                const response = await api.patch(
                    `/api/user/groups/${id}/events/${eventForm.id}`,
                    formattedEvent
                );
                window.location.reload();
            } else {
                const response = await api.post(`/api/user/groups/${id}/events`, formattedEvent);
                setEvents([...events, response.data.data]);
            }
            setEventForm(null);
        } catch (error) {
            setFormError("Сталася помилка при збереженні події.");
        } finally {
            setSubmitting(false);
            window.location.reload();
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

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-300">
            <header className="bg-gray-800 shadow-md py-8 relative">
                <h1 className="text-4xl font-extrabold text-center text-white tracking-wide">
                    Розклад
                </h1>
            </header>
            <main className="flex-grow p-8 max-w-4xl mx-auto space-y-8">
                {isStarosta && (
                    <div className="mt-4">
                        <button
                            onClick={handleCreateEvent}
                            className="px-4 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none text-white"
                        >
                            Створити подію
                        </button>
                    </div>
                )}

                {eventForm && (
                    <div className="bg-black/50 p-4 rounded border border-gray-700 text-white space-y-4 mt-4">
                        <h3 className="text-xl font-bold">
                            {eventForm.id ? "Редагування події" : "Створення події"}
                        </h3>
                        {formError && (
                            <div className="bg-red-700/80 text-white px-4 py-2 rounded-lg font-semibold">
                                {formError}
                            </div>
                        )}
                        <form className="space-y-4">
                            <div>
                                <label className="block font-medium">Назва:</label>
                                <input
                                    type="text"
                                    value={eventForm.name}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, name: e.target.value })
                                    }
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Дата:</label>
                                <input
                                    type="date"
                                    value={eventForm.date}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, date: e.target.value })
                                    }
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Час:</label>
                                <input
                                    type="time"
                                    value={eventForm.time}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, time: e.target.value })
                                    }
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Повторювана подія:</label>
                                <input
                                    type="checkbox"
                                    checked={eventForm.recurring}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, recurring: e.target.checked })
                                    }
                                    className="ml-2"
                                />
                            </div>
                            {eventForm.recurring && (
                                <div>
                                    <label className="block font-medium">Повторювати до:</label>
                                    <input
                                        type="date"
                                        value={eventForm.recurring_until}
                                        onChange={(e) =>
                                            setEventForm({
                                                ...eventForm,
                                                recurring_until: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block font-medium">Посилання:</label>
                                <input
                                    type="url"
                                    value={eventForm.url}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, url: e.target.value })
                                    }
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Активна:</label>
                                <input
                                    type="checkbox"
                                    checked={eventForm.is_active}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, is_active: e.target.checked })
                                    }
                                    className="ml-2"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={handleSubmitEvent}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:outline-none disabled:opacity-50"
                                >
                                    Зберегти
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEventForm(null)}
                                    className="px-4 py-2 bg-gray-600 rounded-lg font-bold hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 focus:outline-none"
                                >
                                    Скасувати
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="pt-2 flex justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-gray-400 hover:text-gray-300 transition"
                    >
                        Назад на головну
                    </button>
                </div>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                            <h2 className="text-white text-xl font-bold">Підтвердження видалення</h2>
                            <p className="text-gray-300">Ви впевнені, що хочете видалити цю подію?</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={confirmDeleteEvent}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:outline-none disabled:opacity-50"
                                >
                                    Видалити
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, eventId: null })}
                                    className="px-4 py-2 bg-gray-600 rounded-lg font-bold hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 focus:outline-none"
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Події</h2>
                    {events.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-black/40 p-4 rounded-lg border border-gray-700 text-white space-y-2"
                                >
                                    <div>
                                        <span className="font-medium">Назва:</span> {event.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Дата:</span> {event.date}{" "}
                                        {event.time}
                                    </div>
                                    <div>
                                        <span className="font-medium">Посилання:</span>{" "}
                                        <a
                                            href={event.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {event.url}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="font-medium">Активна:</span>{" "}
                                        {event.is_active ? "Так" : "Ні"}
                                    </div>
                                    {isStarosta && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditEvent(event)}
                                                className="px-4 py-2 bg-yellow-600 rounded-lg font-bold hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-500 focus:outline-none"
                                            >
                                                Редагувати
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="px-4 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:outline-none"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Подій не знайдено.</div>
                    )}
                </section>
            </main>
            <footer className="p-4 text-center text-sm text-gray-500 bg-gray-900">
                © {new Date().getFullYear()} StarostaHub
            </footer>
        </div>
    );
}
