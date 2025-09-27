import React from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import { FaGithub, FaLinkedin, FaTwitter, FaRobot, FaUserTie, FaChartLine, FaSyncAlt, FaBrain, FaUsers } from "react-icons/fa";
import { SiJavascript, SiReact, SiTailwindcss, SiNodedotjs, SiMongodb, SiFigma, SiAdobexd } from "react-icons/si";

const DeveloperCard = ({ name, role, description, image, skills, socialLinks }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl"
    >
        <div className="flex flex-col items-center">
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 p-1">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {role}
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <p className="text-gray-400 text-center mb-4">{description}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                {skills.map((Skill, index) => (
                    <Skill key={index} className="text-2xl text-blue-400 hover:text-blue-300 transition-colors" />
                ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                        <link.icon className="text-2xl" />
                    </a>
                ))}
            </div>
        </div>
    </motion.div>
);

const AboutPage = () => {
    const features = [
        {
            icon: FaBrain,
            title: "Smart Resume Analysis",
            description: "Our platform helps analyze resumes, identify key skills, and suggest improvements based on industry best practices. The system provides tailored recommendations to enhance your professional profile."
        },
        {
            icon: FaUserTie,
            title: "Interactive Mock Interviews",
            description: "Experience realistic mock interviews with AI-powered questions that adapt to your resume and skill level. Our system simulates real-world interview scenarios and provides instant, constructive feedback to help you improve."
        },
        {
            icon: FaChartLine,
            title: "Behavioral Analysis",
            description: "Advanced analysis of interview performance, including body language, tone, and communication style. Get detailed insights on your strengths and areas for improvement through comprehensive performance metrics."
        },
        {
            icon: FaSyncAlt,
            title: "Iterative Learning",
            description: "Track your progress over time, update your resume based on AI feedback, and retake mock interviews to continuously refine your skills. Our platform adapts to your growth and provides increasingly challenging scenarios."
        }
    ];

    const developers = [
        {
            name: "Azhar",
            role: "UI Developer",
            description: "Passionate about creating beautiful and intuitive user interfaces. Specializes in React and modern frontend technologies.",
            image: "https://avatars.githubusercontent.com/bunnysayzz",
            skills: [SiReact, SiJavascript, SiTailwindcss],
            socialLinks: [
                { icon: FaGithub, url: "https://github.com/bunnysayzz" },
                { icon: FaLinkedin, url: "https://www.linkedin.com/in/azharuddindev" },
                { icon: FaTwitter, url: "https://x.com/apt_azhar" }
            ]
        },
        {
            name: "Deepak",
            role: "Designer",
            description: "Creative designer with an eye for detail. Transforms ideas into visually stunning experiences.",
            image: "https://avatars.githubusercontent.com/DeepakRajjj",
            skills: [SiJavascript, SiReact, SiTailwindcss],
            socialLinks: [
                { icon: FaGithub, url: "https://github.com/DeepakRajjj" },
                { icon: FaLinkedin, url: "https://linkedin.com/in/deepak-rajj" },

            ]
        },
        {
            name: "Abhishek",
            role: "Backend Developer",
            description: "Expert in building robust and scalable backend systems. Passionate about clean code and performance.",
            image: "https://avatars.githubusercontent.com/abhidigiworld",
            skills: [SiNodedotjs, SiMongodb],
            socialLinks: [
                { icon: FaGithub, url: "https://github.com/abhidigiworld" },
                { icon: FaLinkedin, url: "https://linkedin.com/in/abhidigiworld" },
                { icon: FaTwitter, url: "https://twitter.com/abhisharma0812" }
            ]
        },
        {
            name: "Ayush",
            role: "Developer",
            description: "Full-stack developer with a love for innovative solutions. Brings ideas to life through code.",
            image: "https://avatars.githubusercontent.com/ayushdev",
            skills: [SiReact, SiNodedotjs, SiMongodb],
            socialLinks: [
                { icon: FaGithub, url: "https://github.com/ayushdev" },
                { icon: FaLinkedin, url: "https://www.linkedin.com/in/ayush-singh17/" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-white mb-6"
                    >
                        <span className="text-blue-500">RRR</span>: Resume Recognition & Reconfiguration
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6 text-gray-400"
                    >
                        <p className="text-xl max-w-3xl mx-auto">
                            RRR stands for <span className="text-blue-400 font-semibold">Resume Recognition & Reconfiguration</span>,
                            a name that embodies our platform's core functionalities:
                        </p>
                        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-blue-400 font-semibold text-lg mb-2">Resume</h3>
                                <p className="text-sm">
                                    The foundation of your professional identity, crafted with precision and purpose.
                                </p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-blue-400 font-semibold text-lg mb-2">Recognition</h3>
                                <p className="text-sm">
                                    Smart analysis that identifies your skills, experiences, and potential.
                                </p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-blue-400 font-semibold text-lg mb-2">Reconfiguration</h3>
                                <p className="text-sm">
                                    Intelligent optimization and restructuring to maximize your career opportunities.
                                </p>
                            </div>
                        </div>
                        <p className="text-xl max-w-3xl mx-auto mt-8">
                            Our platform combines these three elements to create a comprehensive career development
                            solution that helps you build, optimize, and present your professional profile effectively.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Features */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-center text-white mb-16"
                    >
                        Our <span className="text-blue-500">Features</span>
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-colors"
                            >
                                <feature.icon className="text-4xl text-blue-400 mb-4" />
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Your Journey With RRR */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-center text-white mb-16"
                    >
                        Your Journey With <span className="text-blue-500">RRR</span>
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-800 rounded-xl p-8"
                        >
                            <div className="text-4xl text-blue-400 mb-6">01</div>
                            <h3 className="text-xl font-bold text-white mb-4">Resume Enhancement</h3>
                            <ul className="text-gray-300 space-y-3">
                                <li>• Get professional suggestions for your resume content</li>
                                <li>• Highlight your key achievements effectively</li>
                                <li>• Optimize your resume for ATS systems</li>
                                <li>• Receive industry-specific formatting recommendations</li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800 rounded-xl p-8"
                        >
                            <div className="text-4xl text-blue-400 mb-6">02</div>
                            <h3 className="text-xl font-bold text-white mb-4">Interview Preparation</h3>
                            <ul className="text-gray-300 space-y-3">
                                <li>• Practice with personalized interview questions</li>
                                <li>• Receive real-time feedback on your responses</li>
                                <li>• Improve your communication skills</li>
                                <li>• Build confidence through realistic scenarios</li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-800 rounded-xl p-8"
                        >
                            <div className="text-4xl text-blue-400 mb-6">03</div>
                            <h3 className="text-xl font-bold text-white mb-4">Career Growth</h3>
                            <ul className="text-gray-300 space-y-3">
                                <li>• Track your improvement over time</li>
                                <li>• Get insights into industry requirements</li>
                                <li>• Adapt to changing job market needs</li>
                                <li>• Build a stronger professional profile</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-4 bg-gray-800">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-center text-white mb-16"
                    >
                        Meet Our <span className="text-blue-500">Team</span>
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {developers.map((dev, index) => (
                            <DeveloperCard key={index} {...dev} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-white mb-8"
                    >
                        Our <span className="text-blue-500">Mission</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                    >
                        To empower job seekers with AI-driven tools that make the job search process
                        more efficient and effective. We believe in combining technology with human
                        insight to create opportunities for everyone.
                    </motion.p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
