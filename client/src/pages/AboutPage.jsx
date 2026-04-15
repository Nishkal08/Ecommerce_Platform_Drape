import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="page">
      {/* Editorial Hero */}
      <div style={{ position: 'relative', height: '50vh', minHeight: '360px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80"
          alt="Our Story"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: 'clamp(36px, 5vw, 64px)', fontStyle: 'italic' }}>
            Our Story
          </h1>
        </div>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--charcoal)', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Pieces beyond seasons, created to adapt and remain timeless.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
            DRAPE was born from a simple belief: fashion should feel effortless. Launched in 2024, we set out to create
            a curated collection of essentials that transcend trends — pieces designed to move with you, adapt to your
            style, and last beyond a single season.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: '1.8' }}>
            Our design philosophy is rooted in minimalism — not as an aesthetic constraint, but as a foundation for
            personal expression. We believe the best wardrobe is one that works together seamlessly, where every piece
            complements the next.
          </p>
        </div>

        {/* Editorial Split Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center', marginBottom: '80px' }} className="about-split">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 992px) {
              .about-split { grid-template-columns: 1fr 1fr !important; }
            }
          `}} />
          <div style={{ height: '500px', background: 'var(--surface)' }}>
            <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop" alt="Craftsmanship" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '0 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '20px' }}>Our Craftsmanship</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.8', marginBottom: '20px' }}>
              Every garment in our collection is crafted with absolute intention. We partner exclusively with ethical 
              manufacturers in Portugal and Italy who share our commitment to uncompromising quality, 
              fair labor practices, and sustainable production cycles.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.8' }}>
              From the exact weight and drape of our organic cottons, to the custom finish on our hardware, 
              no detail goes unconsidered. We source small-batch, premium textiles that actually get better with age.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '32px 0 64px', borderTop: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px' }}>Ready to discover?</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Explore the new season essentials.</p>
          <Link to="/products" className="btn btn--primary btn--lg">Explore the Collection</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
