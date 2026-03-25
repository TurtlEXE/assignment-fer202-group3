import axios from "axios";

const BASE_URL = "http://localhost:9999";

const api = axios.create({
  baseURL: BASE_URL,
});

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const toNumber = (value) => Number(value || 0);

const sortBySlotStart = (a, b) => a.slotStart.localeCompare(b.slotStart);
const keyByCourtSlot = (courtId, slotId) => `${courtId}-${slotId}`;

export const ownerService = {
  async getMyComplexes(user) {
    if (!user?.id) {
      return [];
    }

    if (user.role === "owner") {
      const { data } = await api.get(`/complexes?ownerId=${user.id}`);
      return data;
    }

    const { data } = await api.get("/complexes");
    return data;
  },

  async getComplexById(complexId) {
    const { data } = await api.get(`/complexes?id=${complexId}`);
    return data[0] || null;
  },

  async getCourtsByComplex(complexId) {
    const { data } = await api.get(`/courts?complexId=${complexId}`);
    return data;
  },

  async getSlotsByType(slotType) {
    const { data } = await api.get(`/slots?slotType=${slotType}`);
    return data.sort(sortBySlotStart);
  },

  async getCourtSchedulesByDate(date) {
    const { data } = await api.get(`/courtSchedules?date=${date}`);
    return data;
  },

  async getComplexScheduleByDate(complexId, date) {
    const [complex, courtData, daySchedules] = await Promise.all([
      this.getComplexById(complexId),
      this.getCourtsByComplex(complexId),
      this.getCourtSchedulesByDate(date),
    ]);

    if (!complex) {
      return null;
    }

    const courts = courtData.filter((court) => court.status !== "deleted");
    const slotType = complex.slotType || "60min";
    const openTime = complex.openTime || "00:00:00";
    const closeTime = complex.closeTime || "23:59:59";

    const slots = (await this.getSlotsByType(slotType)).filter(
      (slot) => slot.slotStart >= openTime && slot.slotEnd <= closeTime
    );

    const courtIds = new Set(courts.map((court) => court.id));
    const bookedScheduleMap = daySchedules
      .filter((item) => item.status === "booked" && courtIds.has(item.courtId))
      .reduce((acc, item) => {
        acc[keyByCourtSlot(item.courtId, item.slotId)] = item;
        return acc;
      }, {});

    const bookedKeys = new Set(Object.keys(bookedScheduleMap));

    return {
      complex,
      courts,
      slots,
      bookedKeys,
      bookedScheduleMap,
    };
  },

  async getBookingDetailByItemId(bookingItemId) {
    const { data: bookingItems } = await api.get(`/bookingItems?id=${bookingItemId}`);
    const bookingItem = bookingItems[0];

    if (!bookingItem) {
      return null;
    }

    const [{ data: bookings }, { data: courts }, { data: schedules }] = await Promise.all([
      api.get(`/bookings?id=${bookingItem.bookingId}`),
      api.get(`/courts?id=${bookingItem.courtId}`),
      api.get(`/courtSchedules?bookingItemId=${bookingItem.id}`),
    ]);

    const booking = bookings[0] || null;
    const court = courts[0] || null;

    if (!booking) {
      return null;
    }

    const [customerRes, paymentRes, slotsRes] = await Promise.all([
      api.get(`/users?id=${booking.customerId}`),
      api.get(`/payments?bookingId=${booking.id}`),
      schedules.length
        ? api.get(`/slots?id=${schedules.map((item) => item.slotId).join("&id=")}`)
        : Promise.resolve({ data: [] }),
    ]);

    const slotMap = slotsRes.data.reduce((acc, slot) => {
      acc[slot.id] = slot;
      return acc;
    }, {});

    const bookedSlots = schedules
      .map((item) => slotMap[item.slotId])
      .filter(Boolean)
      .sort(sortBySlotStart);

    return {
      booking,
      bookingItem,
      court,
      customer: customerRes.data[0] || null,
      payment: paymentRes.data[0] || null,
      bookedSlots,
    };
  },

  async updateBookingStatus(bookingId, status) {
    const { data } = await api.patch(`/bookings/${bookingId}`, { status });
    return data;
  },

  async createCourt(complexId, payload) {
    const body = {
      id: createId(),
      complexId,
      name: payload.name.trim(),
      courtType: payload.courtType,
      surfaceType: payload.surfaceType,
      status: payload.status,
      description: (payload.description || "").trim(),
      createdAt: new Date().toISOString(),
    };

    const { data } = await api.post("/courts", body);
    return data;
  },

  async updateCourt(courtId, payload) {
    const body = {
      name: payload.name.trim(),
      courtType: payload.courtType,
      surfaceType: payload.surfaceType,
      status: payload.status,
      description: (payload.description || "").trim(),
    };

    const { data } = await api.patch(`/courts/${courtId}`, body);
    return data;
  },

  async deleteCourt(courtId) {
    const { data: bookingItems } = await api.get(`/bookingItems?courtId=${courtId}`);
    const hasBookedOnce = bookingItems.length > 0;

    if (hasBookedOnce) {
      const { data } = await api.patch(`/courts/${courtId}`, { status: "deleted" });
      return { mode: "soft", court: data };
    }

    await api.delete(`/courts/${courtId}`);
    return { mode: "hard", courtId };
  },

  async getPriceRulesByComplex(complexId) {
    const { data } = await api.get(`/priceRules?complexId=${complexId}`);
    return data;
  },

  async createPriceRule(complexId, payload) {
    const body = {
      id: createId(),
      complexId,
      courtType: payload.courtType,
      dayType: payload.dayType,
      startTime: payload.startTime,
      endTime: payload.endTime,
      pricePerHour: toNumber(payload.pricePerHour),
      effectiveFrom: payload.effectiveFrom,
      effectiveTo: payload.effectiveTo || null,
    };

    const { data } = await api.post("/priceRules", body);
    return data;
  },

  async updatePriceRule(ruleId, payload) {
    const body = {
      courtType: payload.courtType,
      dayType: payload.dayType,
      startTime: payload.startTime,
      endTime: payload.endTime,
      pricePerHour: toNumber(payload.pricePerHour),
      effectiveFrom: payload.effectiveFrom,
      effectiveTo: payload.effectiveTo || null,
    };

    const { data } = await api.patch(`/priceRules/${ruleId}`, body);
    return data;
  },

  async deletePriceRule(ruleId) {
    await api.delete(`/priceRules/${ruleId}`);
  },
};
