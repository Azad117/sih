import React, { useState } from 'react';

// --- Reusable SVG Icon Components ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944c-3.12 0-5.644 2.524-5.644 5.644 0 3.12 2.524 5.644 5.644 5.644s5.644-2.524 5.644-5.644C15.644 4.468 13.12 1.944 10 1.944zM8.75 16.25a.75.75 0 001.5 0v-5.5a.75.75 0 00-1.5 0v5.5zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" /></svg>
);
const CardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 9v7a2 2 0 002 2h12a2 2 0 002-2V9H2zm7 5a1 1 0 100-2 1 1 0 000 2z" /></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
);


export default function TouristRegistration() {
    const [formData, setFormData] = useState({
        fullName: '',
        passport: '',
        arrivalDate: '',
        departureDate: '',
        emergencyContact: '',
        consent: false,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // --- Handles changes in form inputs ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error message when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // --- Validates the form data ---
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
        if (!formData.passport.trim()) newErrors.passport = "ID Number is required.";
        if (!formData.arrivalDate) newErrors.arrivalDate = "Arrival Date is required.";
        if (!formData.departureDate) newErrors.departureDate = "Departure Date is required.";
        if (formData.arrivalDate && formData.departureDate && new Date(formData.departureDate) <= new Date(formData.arrivalDate)) {
            newErrors.departureDate = "Departure date must be after arrival date.";
        }
        if (!formData.emergencyContact.trim()) newErrors.emergencyContact = "Emergency Contact is required.";
        if (!formData.consent) newErrors.consent = "You must agree to the terms to proceed.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Handles the form submission ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form submitted successfully:", formData);
            // In a real app, you would send this data to the backend.
            setIsSubmitted(true);
        }
    };
    
    // --- Resets the form to allow another registration ---
    const handleRegisterAnother = () => {
        setFormData({
            fullName: '', passport: '', arrivalDate: '',
            departureDate: '', emergencyContact: '', consent: false,
        });
        setErrors({});
        setIsSubmitted(false);
    };


    // --- Render the Confirmation View if form is submitted ---
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">Your secure Digital ID has been generated.</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TouristID-T-RANDOM-${Math.floor(1000 + Math.random() * 9000)}`} alt="QR Code" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 text-left">{formData.fullName}</h3>
                                <p className="text-xs text-gray-500 mt-2 text-left">Valid From: <span className="font-medium">{new Date(formData.arrivalDate).toLocaleDateString()}</span></p>
                                <p className="text-xs text-gray-500 text-left">Valid To: <span className="font-medium">{new Date(formData.departureDate).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleRegisterAnother} className="w-full mt-6 text-center py-2 px-4 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm font-medium">
                        Register Another Tourist
                    </button>
                </div>
            </div>
        );
    }
    

    // --- Render the Registration Form View ---
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                
                {/* Left Column: Information */}
                <div className="bg-indigo-600 text-white p-8 md:p-12">
                    <h1 className="text-3xl font-bold mb-4">Register for Your Secure Digital ID</h1>
                    <p className="text-indigo-200 mb-8">
                        Complete this one-time registration to enhance your safety and travel experience.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-start"><InfoIcon /><div><h3 className="font-semibold">Enhanced Safety</h3><p className="text-sm text-indigo-200">Real-time location monitoring for your protection.</p></div></div>
                        <div className="flex items-start"><CardIcon /><div><h3 className="font-semibold">Digital Convenience</h3><p className="text-sm text-indigo-200">Secure, time-bound ID for easy verification.</p></div></div>
                        <div className="flex items-start"><LockIcon /><div><h3 className="font-semibold">Privacy First</h3><p className="text-sm text-indigo-200">Your data is encrypted and deleted after your trip.</p></div></div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Tourist Registration</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} placeholder="John Doe" />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>
                            <div>
                                <label htmlFor="passport" className="block text-sm font-medium text-gray-700">Passport / National ID</label>
                                <input type="text" id="passport" name="passport" value={formData.passport} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${errors.passport ? 'border-red-500' : 'border-gray-300'}`} placeholder="A12345678" />
                                {errors.passport && <p className="text-red-500 text-xs mt-1">{errors.passport}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700">Arrival Date</label>
                                    <input type="date" id="arrivalDate" name="arrivalDate" value={formData.arrivalDate} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${errors.arrivalDate ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.arrivalDate && <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>}
                                </div>
                                <div>
                                    <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">Departure Date</label>
                                    <input type="date" id="departureDate" name="departureDate" value={formData.departureDate} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${errors.departureDate ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.departureDate && <p className="text-red-500 text-xs mt-1">{errors.departureDate}</p>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                                <input type="text" id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${errors.emergencyContact ? 'border-red-500' : 'border-gray-300'}`} placeholder="Jane Doe" />
                                {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
                            </div>
                            <div className="flex items-start pt-2">
                                <div className="flex items-center h-5">
                                    <input id="consent" name="consent" type="checkbox" checked={formData.consent} onChange={handleChange} required className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="consent" className="font-medium text-gray-700">I agree to the Terms of Service</label>
                                    <p className="text-gray-500">I consent to location tracking for safety purposes.</p>
                                    {errors.consent && <p className="text-red-500 text-xs mt-1">{errors.consent}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                Generate My Digital ID
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
