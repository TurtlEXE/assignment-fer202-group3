import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const globalContext = createContext();

const BASE = "http://localhost:9999";

export default function GlobalContextProvider({ children }) {
    const [users, setUsers]                       = useState([]);
    const [complexes, setComplexes]               = useState([]);
    const [registrationForms, setRegistrationForms] = useState([]);
    const [courts, setCourts]                     = useState([]);
    const [priceRules, setPriceRules]             = useState([]);
    const [bookings, setBookings]                 = useState([]);
    const [bookingItems, setBookingItems]         = useState([]);
    const [payments, setPayments]                 = useState([]);
    const [reviews, setReviews]                   = useState([]);
    const [notifications, setNotifications]       = useState([]);
    const [complexImages, setComplexImages]       = useState([]);
    const [courtSchedules, setCourtSchedules]     = useState([]);
    const [complexAmenities, setComplexAmenities] = useState([]);

    useEffect(() => {
        Promise.all([
            axios.get(`${BASE}/users`),
            axios.get(`${BASE}/complexes`),
            axios.get(`${BASE}/registrationForms`),
            axios.get(`${BASE}/courts`),
            axios.get(`${BASE}/priceRules`),
            axios.get(`${BASE}/bookings`),
            axios.get(`${BASE}/bookingItems`),
            axios.get(`${BASE}/payments`),
            axios.get(`${BASE}/reviews`),
            axios.get(`${BASE}/notifications`),
            axios.get(`${BASE}/complexImages`),
            axios.get(`${BASE}/courtSchedules`),
            axios.get(`${BASE}/complexAmenities`),
        ]).then(([
            resUsers, resComplexes, resRegistrationForms, resCourts,
            resPriceRules, resBookings, resBookingItems, resPayments,
            resReviews, resNotifications, resComplexImages,
            resCourtSchedules, resComplexAmenities
        ]) => {
            setUsers(resUsers.data);
            setComplexes(resComplexes.data);
            setRegistrationForms(resRegistrationForms.data);
            setCourts(resCourts.data);
            setPriceRules(resPriceRules.data);
            setBookings(resBookings.data);
            setBookingItems(resBookingItems.data);
            setPayments(resPayments.data);
            setReviews(resReviews.data);
            setNotifications(resNotifications.data);
            setComplexImages(resComplexImages.data);
            setCourtSchedules(resCourtSchedules.data);
            setComplexAmenities(resComplexAmenities.data);
        });
    }, []);

    return (
        <globalContext.Provider value={{
            users, setUsers,
            complexes, setComplexes,
            registrationForms, setRegistrationForms,
            courts, setCourts,
            priceRules, setPriceRules,
            bookings, setBookings,
            bookingItems, setBookingItems,
            payments, setPayments,
            reviews, setReviews,
            notifications, setNotifications,
            complexImages, setComplexImages,
            courtSchedules, setCourtSchedules,
            complexAmenities, setComplexAmenities,
        }}>
            {children}
        </globalContext.Provider>
    );
}

