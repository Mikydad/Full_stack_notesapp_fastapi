import React from "react";

function HeroSection() {
  return (
    <section className="bg-gray-50 flex items-center flex-1">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
        
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Capture Your Ideas  
            <span className="text-indigo-600"> Anytime, Anywhere</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            A simple and powerful notes app to organize your thoughts, 
            boost productivity, and never forget an idea again.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
              Get Started
            </button>
            <button className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/Hero_section.png"
            alt="Notes App Hero"
            className="w-full max-w-md drop-shadow-xl"
          />
        </div>

      </div>
    </section>
  );
}

export default HeroSection;
