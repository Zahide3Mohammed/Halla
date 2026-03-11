import React from "react";
import "./askfeatures.css";

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">

    <div className="feature-icon">
      <span className="material-symbols-outlined">
        <img src={icon} alt="" />
      </span>
    </div>

    <div className="feature-content">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>

  </div>
);

const Features = () => {

  const features = [
    {
      icon: "/icons/verified.png",
      title: "Scientifically Backed",
      description:
        "Based on the Big Five and other established behavioral models used by top recruiters."
    },
    {
      icon: "/icons/work_history.png",
      title: "Career Alignment",
      description:
        "Identify career paths and work environments where your personality will naturally thrive."
    },
    {
      icon: "/icons/target.png",
      title: "Actionable Strengths",
      description:
        "Don't just get a label—get a roadmap for leveraging your unique traits in daily life."
    }
  ];

  return (
    <section className="features-section">

      <div className="features-container">

        <div className="features-header">

          <h2>
            Why take the test?
          </h2>

          <p>
            Our assessment is designed by leading organizational psychologists
            to provide actionable, real-world insights into your personality.
          </p>

        </div>


        <div className="features-grid">

          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}

        </div>

      </div>

    </section>
  );
};

export default Features;
