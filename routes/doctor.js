// Profile Management
GET    /api/doctors/profile        // Get doctor profile
PUT    /api/doctors/profile        // Update doctor profile

// Availability Management
GET    /api/doctors/availability   // Get availability
PUT    /api/doctors/availability   // Update availability

// Appointment Management
GET    /api/doctors/appointments   // Get my appointments
PUT    /api/doctors/appointments/:id/status  // Update status

// Patient Management
GET    /api/doctors/patients       // Get my patients
POST   /api/doctors/medical-records // Add medical record