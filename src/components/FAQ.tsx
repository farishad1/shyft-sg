'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
    {
        question: 'What is Shyft Sg?',
        answer: 'Shyft Sg is a hospitality staffing platform that connects verified workers with boutique hotels, capsule hotels, and serviced apartments across Singapore. We help workers find flexible shifts while helping hotels fill staffing needs quickly.',
    },
    {
        question: 'Who can work on Shyft Sg?',
        answer: 'Workers must be at least 13 years old and have the legal right to work in Singapore (Citizens, PRs, Student Pass holders, or other valid work passes). Once your profile is approved, you can book shifts instantly.',
    },
    {
        question: 'How does payment work?',
        answer: 'Payment goes direct from hotel to you. Shyft Sg provides a tracking system where you can view your estimated earnings and shift history.',
    },
    {
        question: 'What are the Worker Tiers?',
        answer: 'Workers progress through tiers based on hours worked: Silver (0-50 hours), Gold (50+ hours), and Platinum (200+ hours). Higher tiers unlock perks like priority admin support and exclusive rewards.',
    },
    {
        question: 'Can I cancel a shift after applying?',
        answer: 'Cancellations made more than 24 hours before a shift start time are allowed. However, cancelling within 24 hours of a shift may result in account suspension. We take reliability seriously.',
    },
    {
        question: 'How do hotels get verified?',
        answer: 'Hotels must provide their Unique Entity Number (UEN) during registration. Our admin team verifies this information before the hotel can post shifts. This ensures all job postings come from legitimate businesses.',
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="section" style={{ background: 'var(--background-secondary)' }}>
            <div className="container">
                <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    Frequently Asked <span className="text-gold">Questions</span>
                </h2>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {FAQ_ITEMS.map((item, index) => (
                        <div key={index} className="accordion-item">
                            <button
                                className="accordion-trigger"
                                onClick={() => toggleItem(index)}
                                data-state={openIndex === index ? 'open' : 'closed'}
                            >
                                <span>{item.question}</span>
                                <ChevronDown
                                    className="accordion-icon"
                                    size={20}
                                    style={{
                                        transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.25s ease',
                                    }}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="accordion-content">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
