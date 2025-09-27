import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";
const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                toast.success("Sent Sucessfully");
                // alert("Thank you for reaching out! We'll get back to you soon.");
                setFormData({ name: "", email: "", message: "" });
            } else {
                console.error("Contact form submission failed");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <>
            <Header/>
            <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300">
                <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg">
                    {/* Left Side: AI Image with Pulse Effect */}
                    <div className="w-1/2 p-6 flex items-center justify-center">
                        <img
                            src="https://img.freepik.com/free-vector/head-with-ai-chip_78370-3672.jpg" // Replace with your AI-themed image URL
                            alt="AI Technology"
                            className="w-full h-auto rounded-lg animate-pulse "
                        />
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="w-1/2 p-8">
                        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                            Get in Touch
                        </h1>
                        <p className="text-center text-gray-600 mb-6">
                            We are committed to providing excellent service. If you have any
                            questions or need assistance, feel free to reach out to us.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default ContactPage;
