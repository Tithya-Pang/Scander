import { Link } from "react-router-dom";
export default function About() {
 return <main><div className="gg-container gg-page-heading"><span className="gg-kicker">ABOUT GATHER GROUNDS</span><h1>Made for our restaurant.<br/><em>Built around our team.</em></h1><p>Scander supports the ordering and management workflow at Gather Grounds.</p></div>
        <section className="gg-section gg-about" id="about">
          <div className="gg-container gg-about-grid">
            <div className="gg-about-visual">
              <div className="gg-about-photo"><img src="/images/menu/avocado-toast.jpg" alt="A plated café dish from the Scander menu image collection" loading="lazy" /></div>
              <div className="gg-image-note"><span>GATHER GROUNDS</span><strong>Made for the people behind every order.</strong></div>
            </div>
            <div className="gg-about-content">
              <span className="gg-kicker">01 / ABOUT</span>
              <h2>More than a café.<br /><em>A connected experience.</em></h2>
              <p>Gather Grounds brings people together over food and coffee. Behind that experience, good coordination matters just as much as good service.</p>
              <p>Scander is the restaurant management system developed for Gather Grounds. It helps bring the essential parts of restaurant operations into one connected workflow—from a guest's order to a dish arriving at the table.</p>
              <div className="gg-about-note"><span className="gg-small-dot"/> Designed specifically for Gather Grounds staff and operations.</div>
            </div>
          </div>
        </section>

<div className="gg-container gg-page-actions gg-page-bottom"><Link className="gg-button gg-button-primary" to="/our-system">Explore our system ↗</Link></div></main>;
}
