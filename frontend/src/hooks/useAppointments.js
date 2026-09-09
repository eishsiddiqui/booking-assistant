import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchAppointments } from "../api/appointments";

/**
 * Custom hook managing appointment state, data fetching, retry handling,
 * optimistic additions, and derived statistics for the dashboard.
 *
 * @param {string|null} token - Authentication JWT
 * @returns {object}
 */
export function useAppointments(token) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [fetchError, setFetchError] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const data = await fetchAppointments(token);
      setAppointments(data.appointments || []);
      setFetchError(null);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setFetchError(err.message || "Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      return;
    }

    fetchAppointments(token)
      .then((data) => {
        if (isMounted) {
          setAppointments(data.appointments || []);
          setFetchError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load appointments:", err);
          setFetchError(err.message || "Failed to load appointments.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const addAppointment = useCallback((newApt) => {
    if (!newApt) return;
    setAppointments((prev) => [newApt, ...prev]);
  }, []);

  const upcomingCount = useMemo(() => {
    return appointments.filter(
      (a) => (a.status || "scheduled").toLowerCase() === "scheduled",
    ).length;
  }, [appointments]);

  const totalCount = appointments.length;

  return {
    appointments,
    isLoading,
    fetchError,
    handleRetry: loadData,
    addAppointment,
    upcomingCount,
    totalCount,
  };
}
