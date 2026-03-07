import React, { useState, useEffect, useCallback } from "react";
import styles from "./Carousel.module.scss";
import deploy from "../../../../assets/connection-deploy.jpg";
import success from "../../../../assets/deployment-success.jpg";
import engine from "../../../../assets/diff-engine.jpg";

const SLIDES = [
  {
    id: 1,
    title: "Semantic Graph Diffing",
    text: "Standard JSON diffs are impossible to read. We analyze your scenario as a connected Directed Acyclic Graph, ignoring visual coordinate noise and highlighting exactly which modules and filters changed.",
    imageUrl: engine,
  },
  {
    id: 2,
    title: "Preserve Production Connections",
    text: "Never overwrite a live authentication token again. Our recursive engine hunts down target connection parameters and preserves them during deployment, so your webhooks stay active.",
    imageUrl: deploy,
  },
  {
    id: 3,
    title: "One-Click Production Deploys",
    text: "Eliminate the manual rebuild tax. Once your changes are reviewed and connections are mapped, deploy complex scenario updates directly to Production with a single click. Sceniform handles the granular module updates automatically.",
    imageUrl: success,
  },
];

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(goToNextSlide, 5000);
    return () => clearInterval(timer);
  }, [goToNextSlide]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className={styles.carouselSection}>
      <div className={styles.carouselWrapper}>
        {/* Slides Grid Container */}
        <div className={styles.carouselContainer}>
          {SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${
                index === currentIndex ? styles.active : ""
              }`}
            >
              <div className={styles.imageColumn}>
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.title} />
                ) : (
                  <span>Image Placeholder ({slide.title})</span>
                )}
              </div>

              <div className={styles.textColumn}>
                <h2>{slide.title}</h2>
                <p>{slide.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Static Indicators sitting completely outside the slides */}
        <div className={styles.indicators}>
          {SLIDES.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => handleDotClick(dotIndex)}
              className={`${styles.dot} ${
                dotIndex === currentIndex ? styles.active : ""
              }`}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
