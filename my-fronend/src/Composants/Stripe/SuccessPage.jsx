import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './success.css';

const SuccessPage = () => {
    return (
        <div className="success-container">
            <div className="success-card">
                <div className="status-box animation-in">
                    <div className="check-icon">✦</div>
                    <h1>Paiement Réussi !</h1>
                    <p>
                        Merci pour votre confiance. <br />
                        Votre commande a été enregistrée avec succès.
                    </p>
                    <div className="action-buttons">
                        <Link to="/login" className="btn-primary">Créer Votre profile</Link>
                        <Link to="/" className="btn-secondary">Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;