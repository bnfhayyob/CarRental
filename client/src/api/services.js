import apiClient from './apiClient';

// ==================== Auth Services ====================
export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/api/user/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/api/user/login', credentials);
    return response.data;
  },

  getUserData: async () => {
    const response = await apiClient.get('/api/user/data');
    return response.data;
  },

  changeRole: async () => {
    const response = await apiClient.post('/api/owner/change-role');
    return response.data;
  },
};

// ==================== Car Services ====================
export const carService = {
  getAllCars: async () => {
    const response = await apiClient.get('/api/cars/');
    return response.data;
  },

  getCarById: async (id) => {
    const response = await apiClient.get(`/api/cars/${id}`);
    return response.data;
  },

  searchCars: async (searchParams) => {
    const response = await apiClient.get('/api/cars/search', { params: searchParams });
    return response.data;
  },

  searchAvailableCars: async (location, startDate, endDate) => {
    const response = await apiClient.get('/api/cars/find-available', {
      params: { location, startDate, endDate }
    });
    return response.data;
  },

  checkAvailability: async (carId, pickupDate, returnDate) => {
    const response = await apiClient.post('/api/cars/check-availability', {
      carId,
      pickupDate,
      returnDate,
    });
    return response.data;
  },

  getMyCars: async () => {
    const response = await apiClient.get('/api/cars/owner/my-cars');
    return response.data;
  },

  addCar: async (formData) => {
    const response = await apiClient.post('/api/owner/add-car', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCar: async (id, carData) => {
    const response = await apiClient.put(`/api/cars/${id}`, carData);
    return response.data;
  },

  deleteCar: async (id) => {
    const response = await apiClient.delete(`/api/cars/${id}`);
    return response.data;
  },

  toggleAvailability: async (id) => {
    const response = await apiClient.patch(`/api/cars/${id}/toggle-availability`);
    return response.data;
  },
};

// ==================== Booking Services ====================
export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/api/booking/create', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await apiClient.get('/api/booking/my-bookings');
    return response.data;
  },

  getOwnerBookings: async () => {
    const response = await apiClient.get('/api/booking/owner-bookings');
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await apiClient.patch(`/api/booking/${bookingId}/status`, { status });
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await apiClient.delete(`/api/booking/${bookingId}`);
    return response.data;
  },
};

// ==================== Owner/Dashboard Services ====================
export const ownerService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/owner/dashboard-stats');
    return response.data;
  },
};
