'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Info, Users, Zap, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';

const HelpAndInfo = () => {
  return (
    <motion.div
      className="relative w-full px-4 py-16 md:px-8 md:py-24 bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 className="text-[var(--primary)] uppercase text-base md:text-lg tracking-widest font-semibold text-center mb-3">
        Help & Information
      </motion.h2>
      <motion.h3 className="text-center text-3xl md:text-5xl font-extrabold mb-12 text-[var(--foreground)] max-w-4xl leading-tight">
        Your Guide to Kamusi AI: Who We Are and How to Connect
      </motion.h3>

      <div className="max-w-5xl w-full flex flex-col gap-16 md:gap-24">
        {/* About Us Section */}
        <section className="flex flex-col items-center">
          <motion.h4 className="text-[var(--primary)] text-2xl md:text-3xl font-bold mb-8 text-center">
            About Kamusi AI
          </motion.h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
            {/* Mission */}
            <motion.div
              className="bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)] flex flex-col justify-start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4 text-[var(--primary)]">
                <Info className="w-6 h-6" />
                <h5 className="text-xl font-bold text-[var(--foreground)]">Our Mission</h5>
              </div>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                At Kamusi AI, our mission is to revolutionize education by making advanced learning resources accessible and engaging for everyone. We believe in harnessing the power of artificial intelligence to create personalized, interactive, and effective learning experiences that transcend traditional boundaries. Our goal is to empower learners to achieve their full potential, regardless of their background or location.
              </p>
            </motion.div>

            <motion.div
              className="bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)] flex flex-col justify-start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4 text-[var(--primary)]">
                <Users className="w-6 h-6" />
                <h5 className="text-xl font-bold text-[var(--foreground)]">Who We Are</h5>
              </div>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Kamusi AI is developed by a passionate team of educators, technologists, and AI enthusiasts. We are dedicated to building innovative tools that foster curiosity, critical thinking, and lifelong learning. With roots in Nairobi, Kenya, we're driven by the vision of a future where high-quality, AI-powered education is a fundamental right, not a privilege. We are committed to continuous improvement and user-centric design.
              </p>
            </motion.div>

            <motion.div
              className="md:col-span-2 bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)] flex flex-col justify-start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4 text-[var(--primary)]">
                <Zap className="w-6 h-6" />
                <h5 className="text-xl font-bold text-[var(--foreground)]">Our Vision</h5>
              </div>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Our vision is to create a global learning platform that adapts to individual needs, making complex subjects simple and accessible. We aim to break down educational barriers and cultivate a community of empowered learners and creators. We envision a world where anyone, anywhere, can access the knowledge and tools they need to succeed and contribute meaningfully to society.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="flex flex-col items-center mt-16 md:mt-24">
          <motion.h4 className="text-[var(--primary)] text-2xl md:text-3xl font-bold mb-8 text-center">
            Get Support
          </motion.h4>
          <motion.div
            className="bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)] space-y-6 max-w-2xl w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h5 className="text-2xl font-bold text-[var(--foreground)] mb-4">How to Reach Us</h5>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Our team is here to assist you with any questions, feedback, or technical issues you might encounter. We aim to respond promptly to all inquiries.
            </p>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Mail className="text-[var(--primary)] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">Email Us</p>
                  <a href="mailto:info@denexsoftware.co.ke" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                    info@denexsoftware.co.ke
                  </a>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">For general inquiries and support.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-[var(--primary)] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">Call Us</p>
                  <div className="space-y-1">
                    <a href="tel:+254100321690" className="text-[var(--muted-foreground)] block hover:text-[var(--primary)] transition-colors">
                      +254 100 321 690
                    </a>
                    <a href="tel:+254718135935" className="text-[var(--muted-foreground)] block hover:text-[var(--primary)] transition-colors">
                      +254 718 135 935
                    </a>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Reach us by phone for urgent matters.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MessageCircle className="text-[var(--primary)] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">WhatsApp Us</p>
                  <a
                    href="https://wa.me/254718135935?text=Hello%20Kamusi%20AI%2C%20I%27m%20looking%20for%20support."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    +254 718 135 935
                  </a>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Connect with us on WhatsApp for quick assistance.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="text-[var(--primary)] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">Our Location</p>
                  <span className="text-[var(--muted-foreground)]">Nairobi, Kenya</span>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Proudly building from the heart of Kenya.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
};

export default HelpAndInfo;
