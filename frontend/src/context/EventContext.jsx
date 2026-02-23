
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { createEvent, deleteEvent, listEvents, updateEvent } from "../services/eventService";

export const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await listEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, version]);

  const value = useMemo(() => ({
    events,
    loading,
    list: () => events,
    create: async (payload) => {
      const e = await createEvent(payload);
      setVersion(v => v + 1);
      return e;
    },
    update: async (id, patch) => {
      const e = await updateEvent(id, patch);
      setVersion(v => v + 1);
      return e;
    },
    remove: async (id) => {
      await deleteEvent(id);
      setVersion(v => v + 1);
      return true;
    },
    refresh: fetchEvents,
    version,
  }), [events, loading, version, fetchEvents]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
