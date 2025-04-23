"use client";

import { useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
  SlotInfo,
  Event as CalendarEvent,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";


const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type EventRecord = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
};

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to load events");
      const data: EventRecord[] = await res.json();
      setEvents(
        data.map((e) => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start),
          end: new Date(e.end),
          allDay: false,
        }))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handlers
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setModalMode("create");
    setSelectedSlot(slotInfo);
    setTitle("");
    setDescription("");
    setShowModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // find metadata for description
    const rec = eventsRecord.find((e) => e.id === event.id);
    setModalMode("edit");
    setSelectedEvent(rec || null);
    setTitle(rec?.title || "");
    setDescription(rec?.description || "");
    setShowModal(true);
  };

  // We need to keep a separate map of full EventRecord objects
  const [eventsRecord, setEventsRecord] = useState<EventRecord[]>([]);
  useEffect(() => {
    // store full records so we can access metadata
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: EventRecord[]) => setEventsRecord(data));
  }, [loading]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  const saveEvent = async () => {
    try {
      const body: any = { title, description };
      if (modalMode === "create" && selectedSlot) {
        body.start = selectedSlot.start;
        body.end   = selectedSlot.end;
      }
      if (modalMode === "edit" && selectedEvent) {
        body.start = selectedEvent.start;
        body.end   = selectedEvent.end;
      }
      const url =
        modalMode === "create"
          ? "/api/events"
          : `/api/events/${selectedEvent?.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save event");
      await fetchEvents();
      closeModal();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteEvent = async () => {
    if (!selectedEvent) return;
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchEvents();
      closeModal();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading calendar…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="relative">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 600 }}
		date={currentDate}
		view={currentView}
		onNavigate={(date) => setCurrentDate(date)}
		onView={(view) => setCurrentView(view)}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            {/* Close */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {modalMode === "create" ? "New Event" : "Edit Event"}
            </h2>

            <label className="block mb-3">
              <span className="text-gray-700">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-700">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </label>

            <div className="flex justify-end space-x-2 mt-4">
              {modalMode === "edit" && (
                <button
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={deleteEvent}
                >
                  <TrashIcon className="h-5 w-5 mr-1" /> Delete
                </button>
              )}
              <button
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={saveEvent}
              >
                <PencilIcon className="h-5 w-5 mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

