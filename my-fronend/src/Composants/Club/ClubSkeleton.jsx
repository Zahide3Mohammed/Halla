import React from 'react';
import './CSkeleton.css'; // Khass ghir hada

const ClubSkeleton = () => {
  return (
    <div className="ks-app-wrapper ks-loading-state">
      <div className="ks-main-grid">
        
        {/* Sidebar Left */}
        <aside className="ks-sidebar-left">
          <nav className="ks-nav">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ks-nav-item">
                <div className="ks-base ks-circle-sm"></div>
                <div className="ks-base ks-text-sm" style={{width: '80px'}}></div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Feed */}
        <main className="ks-feed">
          {/* Create Post */}
          <div className="ks-card">
            <div className="ks-header">
              <div className="ks-base ks-circle-md"></div>
              <div className="ks-base ks-input-mock"></div>
            </div>
            <div className="ks-footer">
              <div className="ks-base ks-text-sm" style={{width: '60px'}}></div>
              <div className="ks-base ks-btn-mock"></div>
            </div>
          </div>

          {/* Posts List */}
          <div className="ks-posts-list">
            {[1, 2].map((i) => (
              <article key={i} className="ks-card ks-post-card">
                <div className="ks-header">
                  <div className="ks-base ks-circle-md"></div>
                  <div className="ks-info">
                    <div className="ks-base ks-text-md" style={{width: '120px', marginBottom: '5px'}}></div>
                    <div className="ks-base ks-text-xs" style={{width: '40px'}}></div>
                  </div>
                </div>
                <div className="ks-content">
                   <div className="ks-base ks-text-full" style={{marginBottom: '10px'}}></div>
                   <div className="ks-base ks-text-full" style={{width: '70%', marginBottom: '15px'}}></div>
                   <div className="ks-base ks-image-mock"></div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar Right */}
        <aside className="ks-sidebar-right">
          <div className="ks-card">
            <div className="ks-base ks-text-md" style={{marginBottom: '20px', width: '100px'}}></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="ks-item" style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                <div className="ks-base ks-circle-md"></div>
                <div>
                  <div className="ks-base ks-text-sm" style={{width: '80px', marginBottom: '5px'}}></div>
                  <div className="ks-base ks-text-xs" style={{width: '50px'}}></div>
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default ClubSkeleton;