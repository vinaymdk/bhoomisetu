import './TestimonialsSection.css';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'Property Buyer',
    rating: 5,
    text: 'Found my dream home through Bhoomisetu. The AI search made it so easy to find exactly what I was looking for. The customer service team was incredibly helpful throughout the process.',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'Property Seller',
    rating: 5,
    text: 'Sold my apartment within weeks of listing. The verification process was thorough, and I felt confident knowing all listings are verified. Great platform!',
  },
  {
    id: '3',
    name: 'Amit Patel',
    role: 'Property Buyer',
    rating: 5,
    text: 'The AI-powered search is a game-changer. I described what I wanted in plain language, and it found perfect matches. Highly recommend!',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Our Customers Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-rating">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="testimonial-star">⭐</span>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-author-info">
                  <div className="testimonial-author-name">{testimonial.name}</div>
                  <div className="testimonial-author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
