
import { useState } from "react";
import "../../styles/public-pages.css";

const contact = {
  email: "gathergroundscambodia@gmail.com",
  phones: [
    { label: "093 990 992", value: "093990992" },
    { label: "061 880 887", value: "061880887" },
  ],
  social: [
    {
      name: "Facebook",
      short: "f",
      url: "https://www.facebook.com/share/1CLhUSbomc/?mibextid=wwXIfr",
    },
    {
      name: "Instagram",
      short: "◎",
      url: "https://www.instagram.com/gathergrounds_coffee?cplk=bjMzaHI3bWU3OTJm",
    },
    {
      name: "TikTok",
      short: "♪",
      url: "https://www.tiktok.com/@gathergrounds_coffee?_r=1&_t=ZS-9BTkdhmEQa5",
    },
  ],
};

const branches = [
  {
    id: "riverside",
    name: "Riverside",
    label: "Riverside Branch",
    address: "Gather Grounds Riverside, Phnom Penh",
    mapQuery: "HWJC RGM Gather Grounds Phnom Penh",
    mapsUrl: "https://maps.app.goo.gl/QS6jSeAfceHwjJJf6?g_st=ic",
  },
  {
    id: "toul-kork",
    name: "Toul Kork",
    label: "Toul Kork Branch",
    address: "Street 315, Toul Kork, Phnom Penh",
    mapQuery: "Gather Grounds Coffee & Eatery Tuol Kork Street 315 Phnom Penh",
    mapsUrl: "https://maps.app.goo.gl/ULF8QEvD9wexUbUq7?g_st=ic",
  },
  {
    id: "indradevi",
    name: "Indradevi",
    label: "Indradevi Branch",
    address: "Street 594, Phnom Penh",
    mapQuery: "Gather Grounds Coffee & Eatery Indradevi Street 594 Phnom Penh",
    mapsUrl: "https://maps.app.goo.gl/mue5Y7deqxzaDiKz5?g_st=ic",
  },
  {
    id: "phnom-penh-thmei",
    name: "Phnom Penh Thmei",
    label: "Phnom Penh Thmei Branch",
    address: "Street 1978, Phnom Penh",
    mapQuery: "Gather Grounds Coffee & Eatery Phnom Penh Thmei Street 1978",
    mapsUrl: "https://maps.app.goo.gl/V9hersxm5LFUZWgr8?g_st=ic",
  },
  {
    id: "krosung-daendei",
    name: "Krosung DaenDei",
    label: "Krosung DaenDei Branch",
    address: "Krosung DaenDei, Phnom Penh",
    mapQuery: "Gather Grounds Coffee and Eatery Krosung DaenDei Phnom Penh",
    mapsUrl: "https://maps.app.goo.gl/Puv8eZutPFJq7B8p6?g_st=ic",
  },
];

// Google Maps search-based iframe.
// Exact Google Maps embed links can replace these later.
function getEmbedUrl(branch) {
  return (
    "https://maps.google.com/maps?q=" +
    encodeURIComponent(branch.mapQuery) +
    "&output=embed"
  );
}

export default function Contact() {
  const [selectedBranchId, setSelectedBranchId] =
    useState("riverside");

  const selectedBranch =
    branches.find(
      (branch) => branch.id === selectedBranchId
    ) || branches[0];

  return (
    <main className="gg-contact-page">
      {/* PAGE HEADER */}
      <section className="gg-container gg-contact-heading">
        <span className="gg-kicker">
          GATHER GROUNDS / CONTACT
        </span>

        <h1>
          Let's stay
          <br />
          <em>connected.</em>
        </h1>

        <p>
          Have a question or planning your next visit?
          Reach out to us or find a Gather Grounds
          location near you.
        </p>
      </section>

      {/* CONTACT DETAILS */}
      <section className="gg-container gg-contact-main">
        <div className="gg-contact-intro">
          <span className="gg-kicker">GET IN TOUCH</span>

          <h2>We'd love to hear from you.</h2>

          <p>
            Whether you have a question or simply
            want to connect, we're here to help.
          </p>
        </div>

        <div className="gg-contact-cards">
          {/* EMAIL */}
          <article className="gg-contact-card">
            <div className="gg-contact-card-icon">
              <span aria-hidden="true">✉</span>
            </div>

            <span className="gg-contact-card-label">
              EMAIL US
            </span>

            <h3>Email</h3>

            <a
              className="gg-contact-email"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>

            <p>Send us a message anytime.</p>
          </article>

          {/* PHONE */}
          <article className="gg-contact-card">
            <div className="gg-contact-card-icon">
              <span aria-hidden="true">☎</span>
            </div>

            <span className="gg-contact-card-label">
              CALL US
            </span>

            <h3>Phone</h3>

            <div className="gg-contact-phone-list">
              {contact.phones.map((phone) => (
                <a
                  key={phone.value}
                  href={`tel:+855${phone.value.slice(1)}`}
                >
                  {phone.label}
                </a>
              ))}
            </div>

            <p>Tap a number to call us.</p>
          </article>

          {/* SOCIAL MEDIA */}
          <article className="gg-contact-card">
            <div className="gg-contact-card-icon">
              <span aria-hidden="true">♡</span>
            </div>

            <span className="gg-contact-card-label">
              FOLLOW ALONG
            </span>

            <h3>Social Media</h3>

            <div className="gg-social-links">
              {contact.social.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${platform.name}`}
                  title={platform.name}
                >
                  <span aria-hidden="true">
                    {platform.short}
                  </span>

                  <span>{platform.name}</span>
                </a>
              ))}
            </div>

            <p>Stay connected with Gather Grounds.</p>
          </article>
        </div>
      </section>

      {/* BRANCH LOCATIONS */}
      <section className="gg-branches-section">
        <div className="gg-container">
          <div className="gg-branches-heading">
            <div>
              <span className="gg-kicker">
                FIND YOUR GATHER GROUNDS
              </span>

              <h2>
                Find us
                <br />
                <em>around Phnom Penh.</em>
              </h2>
            </div>

            <p>
              With five locations to explore,
              choose your preferred Gather Grounds
              branch and find your way to us.
            </p>
          </div>

          {/* BRANCH SELECTOR */}
          <div className="gg-branch-selector">
            <div className="gg-branch-select-info">
              <span className="gg-branch-pin">⌖</span>

              <div>
                <span className="gg-branch-select-label">
                  CHOOSE YOUR LOCATION
                </span>

                <strong>Our Branches</strong>
              </div>
            </div>

            <div className="gg-branch-select-wrap">
              <label
                htmlFor="branch-select"
                className="gg-visually-hidden"
              >
                Select a Gather Grounds branch
              </label>

              <select
                id="branch-select"
                value={selectedBranchId}
                onChange={(event) =>
                  setSelectedBranchId(event.target.value)
                }
              >
                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC MAP */}
          <div className="gg-branch-map-layout">
            <div className="gg-branch-map">
              <iframe
                key={selectedBranch.id}
                title={`Map of ${selectedBranch.label}`}
                src={getEmbedUrl(selectedBranch)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="gg-branch-details">
              <span className="gg-branch-details-kicker">
                YOUR SELECTED LOCATION
              </span>

              <h3>{selectedBranch.label}</h3>

              <span className="gg-branch-details-divider" />

              <div className="gg-branch-address">
                <span aria-hidden="true">⌖</span>

                <div>
                  <strong>Location</strong>
                  <p>{selectedBranch.address}</p>
                  <small>Phnom Penh, Cambodia</small>
                </div>
              </div>

              <div className="gg-branch-address">
                <span aria-hidden="true">↗</span>

                <div>
                  <strong>Getting here</strong>
                  <p>
                    Open Google Maps for the exact
                    branch location and directions.
                  </p>
                </div>
              </div>

              <a
                href={selectedBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gg-branch-directions"
              >
                Get Directions
                <span aria-hidden="true">↗</span>
              </a>

              <span className="gg-branch-map-caption">
                Showing: {selectedBranch.name}
              </span>
            </div>
          </div>

          {/* QUICK BRANCH SWITCH */}
          <div className="gg-branch-quick-links">
            <span>QUICK SELECT:</span>

            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                className={
                  selectedBranchId === branch.id
                    ? "active"
                    : ""
                }
                aria-pressed={
                  selectedBranchId === branch.id
                }
                onClick={() =>
                  setSelectedBranchId(branch.id)
                }
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM MESSAGE */}
      <section className="gg-contact-bottom">
        <div className="gg-container">
          <span className="gg-kicker">
            SEE YOU AT GATHER GROUNDS
          </span>

          <h2>
            Good coffee.
            <br />
            <em>Great company.</em>
          </h2>

          <p>
            Wherever you choose to visit,
            we look forward to welcoming you.
          </p>
        </div>
      </section>
    </main>
  );
}
