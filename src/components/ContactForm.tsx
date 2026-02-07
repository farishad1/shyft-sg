'use client';

import { useState, FormEvent } from 'react';

export function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section">
            <div className="container">
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    Get in <span className="text-gold">Touch</span>
                </h2>
                <p className="text-muted" style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Have questions or need support? We&apos;re here to help.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="card-static"
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Name & Email row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="label" htmlFor="name">Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    className="input"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label" htmlFor="email">Email *</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="label" htmlFor="phone">Phone (Optional)</label>
                            <input
                                id="phone"
                                type="tel"
                                className="input"
                                placeholder="+65 XXXX XXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="label" htmlFor="subject">Subject *</label>
                            <input
                                id="subject"
                                type="text"
                                className="input"
                                placeholder="How can we help?"
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="label" htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                className="input"
                                placeholder="Tell us more..."
                                rows={5}
                                style={{ resize: 'vertical' }}
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={isSubmitting}
                            style={{ width: '100%' }}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>

                        {/* Status messages */}
                        {submitStatus === 'success' && (
                            <div className="badge-verified" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                ✓ Message sent successfully! We&apos;ll get back to you soon.
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="badge-declined" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                ✗ Something went wrong. Please try again.
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
