import React from 'react';
import './footer.Module.css'; // Import 3adi

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          <div className="footer-brand">
            <h2 className="footer-logo">Halla<span>Maghreb</span></h2>
            <p className="footer-desc">
              أفضل المنصات لتنظيم نشاطاتك اليومية واكتشاف تجارب جديدة في مدينتك. انضم إلينا اليوم!
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-group">
            <h3>الروابط</h3>
            <ul>
              <li><a href="#">الرئيسية</a></li>
              <li><a href="#">النشاطات</a></li>
              <li><a href="#">اتصل بنا</a></li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h3>اشترك في الجديد</h3>
            <div className="footer-input-group">
              <input type="email" placeholder="بريدك الإلكتروني" />
              <button type="button">إرسال</button>
            </div>
          </div>

        </div>
        <div className="footer-bottom">
          <p>© 2026 جميع الحقوق محفوظة. تم تطويره بكل </p>
        </div>
      </div>
    </footer>
  );
}