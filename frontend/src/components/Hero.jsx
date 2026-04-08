import { Button } from './ui/button';
export function Hero({
  onGetStartedClick,
  onLearnMoreClick
}) {
  return <section className="py-16 text-center text-white relative" style={{
    background: 'linear-gradient(rgba(67, 97, 238, 0.9), rgba(63, 55, 201, 0.9)), url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}>
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Track, Showcase, and Grow Your Extracurricular Achievements
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
          A comprehensive platform for students to manage their extracurricular activities, build
          impressive portfolios, and get recognized for their accomplishments.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <Button onClick={onGetStartedClick} className="bg-[#4cc9f0] text-white hover:bg-[#3aa8d4] hover:-translate-y-0.5 transition-all px-8 py-6 text-lg" size="lg">
            Get Started
          </Button>
          <Button onClick={onLearnMoreClick} variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#4361ee] px-8 py-6 text-lg" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>;
}
