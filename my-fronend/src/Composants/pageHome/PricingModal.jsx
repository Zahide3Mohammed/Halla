import React from "react";
import "./PricingModal.css";
import { Link } from "react-router";

export default function PricingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Free",
      price: "0€",
      features: ["Basic features", "Community support", "Limited analytics"],
      popular: false,
    },
    {
      name: "Pro",
      price: "5€",
      features: [
        "All Free features",
        "Advanced analytics",
        "Priority support",
        "Custom domains",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "20€",
      features: [
        "All Pro features",
        "Dedicated support",
        "Team management",
        "Custom integrations",
      ],
      popular: false,
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="pricing-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Choose your plan</h2>
            <p>Simple, transparent pricing</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${
                plan.popular ? "popular" : ""
              }`}
            >
              {plan.popular && (
                <div className="badge55">Most Popular</div>
              )}

              <h3>{plan.name}</h3>

              <div className="price">
                {plan.price}
                <span>/month</span>
              </div>

              <ul>
                {plan.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>

              <Link to='/login' >
                <button className="cta-btn22">
                    Get Started
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}