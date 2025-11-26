import React from "react";
import Image from "next/image";

export const TweetSlider = () => {
  // Images for the infinite scroll - using local tweet images
  const images = [
    "/tweets/1.webp",
    "/tweets/2.webp",
    "/tweets/3.webp",
    "/tweets/4.webp",
    "/tweets/5.webp",
  ];

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-right 30s linear infinite;
        }

        .scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        .image-item {
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .image-item:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .tweet-image {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      `}</style>

      <div className="w-full py-20 bg-black relative overflow-hidden flex flex-col items-center justify-center">
        <div className="relative z-20 flex flex-col items-center justify-center mb-12 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-white/80">
              Real World Results
            </span>
          </div>

          <h2 className="text-balance text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Building Wealth at the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-gradient-from to-gradient-to">
              Speed of AI
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
            The barrier to entry has crumbled. See how creators are turning
            ideas into income faster than ever before.
          </p>
        </div>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-0" />
        {/* Scrolling images container */}
        <div className="relative z-10 w-full flex justify-center py-8">
          <div className="scroll-container w-full max-w-7xl">
            <div className="infinite-scroll flex gap-6 w-max">
              {duplicatedImages.map((image, index) => (
                <div
                  key={index}
                  className="image-item flex-shrink-0 w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-xl overflow-hidden shadow-2xl "
                >
                  <Image
                    src={image}
                    alt={`Tweet screenshot ${(index % images.length) + 1}`}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain tweet-image rounded-xl"
                    unoptimized
                    priority={index < images.length}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-20" />
      </div>
    </>
  );
};
