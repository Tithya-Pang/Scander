import { Link } from "react-router-dom";
import { menuItems } from "../../data/menu";
import "../../styles/home-expanded.css";

// Featured dishes from the existing Scander sample menu.
// Change these IDs later to feature different dishes.
const featuredIds = [19, 9, 7, 12];

const featuredItems = featuredIds
  .map((id) => menuItems.find((item) => item.id === id))
  .filter(Boolean);

const orderingSteps = [
  {
    number: "01",
    title: "Scan",
    description:
      "Scan the QR code at your table when you arrive.",
  },
  {
    number: "02",
    title: "Explore",
    description:
      "Browse our digital menu and choose your favorites.",
  },
  {
    number: "03",
    title: "Order",
    description:
      "Place your order directly from your phone.",
  },
  {
    number: "04",
    title: "Enjoy",
    description:
      "Our kitchen prepares your meal, ready to be served.",
  },
];

export default function Home() {
  return (
    <main className="gg-expanded-home">
      {/* 1. HERO SECTION */}
      <section className="gg-hero">
        <div className="gg-container gg-hero-grid">
          <div className="gg-hero-copy">
            <div className="gg-overline">
              <span className="gg-overline-line" />
              WELCOME TO GATHER GROUNDS
            </div>

            <h1>
              Good food.
              <br />
              Great moments.
              <br />
              <em>Made together.</em>
            </h1>

            <p>
              A place to gather, relax, and enjoy
              something delicious. Discover our food
              and drinks, explore our menu, and enjoy
              a simpler dining experience with Scander.
            </p>

            <div className="gg-hero-actions">
              <Link
                className="gg-button gg-button-primary"
                to="/menu"
              >
                Explore Our Menu <span>↗</span>
              </Link>

              <Link
                className="gg-button gg-button-text"
                to="/about"
              >
                Discover Our Story <span>↗</span>
              </Link>
            </div>

            <div className="gg-hero-foot">
              <span className="gg-small-dot" />
              GATHER GROUNDS
              <span className="gg-foot-separator" />
              POWERED BY SCANDER
            </div>
          </div>

          <div className="gg-hero-media">
            <img
              src="/images/menu/cappuccino.jpg"
              alt="A cappuccino representing the Gather Grounds café experience"
            />

            <div className="gg-hero-image-shade" />

            <div className="gg-photo-caption">
              <span>THE GATHER GROUNDS EXPERIENCE</span>
              <strong>
                A little pause.
                <br />
                A lovely moment.
              </strong>
            </div>

            <div className="gg-floating-label">
              <span className="gg-small-dot" />
              WELCOME IN
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="gg-intro-strip">
        <div className="gg-container gg-strip-inner">
          <span>GOOD FOOD</span>
          <span className="gg-strip-mark">✳</span>
          <span>GOOD COMPANY</span>
          <span className="gg-strip-mark">✳</span>
          <span>GREAT MOMENTS</span>
        </div>
      </div>

      {/* 2. ABOUT PREVIEW */}
      <section className="ggh-about">
        <div className="gg-container ggh-about-grid">
          <div className="ggh-about-image">
            <img
              src="/images/menu/iced-latte.jpg"
              alt="Iced latte served at a café"
              loading="lazy"
            />

            <div className="ggh-image-caption">
              <span>GATHER GROUNDS</span>
              <strong>
                More than just
                <br />
                a dining experience.
              </strong>
            </div>
          </div>

          <div className="ggh-about-content">
            <span className="gg-kicker">
              A LITTLE ABOUT US
            </span>

            <h2>
              A place to
              <br />
              <em>come together.</em>
            </h2>

            <p>
              At Gather Grounds, we believe that
              great food is even better when shared
              with good company.
            </p>

            <p>
              Whether you're stopping by for a coffee,
              enjoying a meal, or spending time with
              friends, we want every visit to feel
              welcoming and effortless.
            </p>

            <p>
              Behind the scenes, Scander helps connect
              our digital menu, orders, and kitchen
              operations so our team can focus on service.
            </p>

            <Link
              to="/about"
              className="ggh-text-link"
            >
              Discover More About Us
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED MENU */}
      <section className="ggh-featured">
        <div className="gg-container">
          <div className="ggh-section-heading">
            <div>
              <span className="gg-kicker">
                A TASTE OF GATHER GROUNDS
              </span>

              <h2>
                Made for
                <br />
                <em>every craving.</em>
              </h2>
            </div>

            <div className="ggh-section-side">
              <p>
                From comforting meals to your favorite
                drinks, explore a few selections
                from our menu.
              </p>

              <Link
                to="/menu"
                className="ggh-text-link"
              >
                View Full Menu
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="ggh-featured-grid">
            {featuredItems.map((item) => (
              <article
                className="ggh-food-card"
                key={item.id}
              >
                <div className="ggh-food-image">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    style={{
                      objectPosition:
                        item.imagePosition || "center",
                    }}
                  />
                </div>

                <div className="ggh-food-info">
                  <span className="ggh-food-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="ggh-food-bottom">
                    <strong>
                      ${Number(item.price).toFixed(2)}
                    </strong>

                    <span>Menu preview</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="ggh-menu-disclaimer">
            Featured items shown from the current
            Scander sample menu.
          </p>

          <div className="ggh-centered-action">
            <Link
              to="/menu"
              className="gg-button gg-button-primary"
            >
              Explore All Food & Drinks
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. QR ORDERING */}
      <section className="ggh-ordering">
        <div className="gg-container">
          <div className="ggh-ordering-header">
            <span className="gg-kicker">
              A SIMPLER WAY TO ORDER
            </span>

            <h2>
              Less waiting.
              <br />
              <em>More enjoying.</em>
            </h2>

            <p>
              With Scander, ordering at Gather Grounds
              is simple. Just scan the QR code at
              your table and let us take care of the rest.
            </p>
          </div>

          <div className="ggh-steps">
            {orderingSteps.map((step) => (
              <div
                className="ggh-step"
                key={step.number}
              >
                <span className="ggh-step-number">
                  {step.number}
                </span>

                <div className="ggh-step-line" />

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="ggh-ordering-footer">
            <div className="ggh-qr-note">
              <span className="ggh-qr-symbol" aria-hidden="true">
                ▦
              </span>

              <p>
                <strong>No app download required.</strong>
                <br />
                Scan, browse, and order from your phone
                when dining at Gather Grounds.
              </p>
            </div>

            <Link
              to="/how-it-works"
              className="ggh-text-link"
            >
              How Ordering Works
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. VISIT GATHER GROUNDS */}
      <section className="ggh-visit">
        <div className="gg-container">
          <div className="ggh-visit-panel">
            <div className="ggh-visit-content">
              <span className="ggh-visit-kicker">
                YOUR NEXT VISIT
              </span>

              <h2>
                There's always
                <br />
                room at our table.
              </h2>

              <p>
                Good food, friendly moments, and a
                welcoming atmosphere await.
                We look forward to seeing you.
              </p>

              <Link
                to="/contact"
                className="ggh-visit-button"
              >
                Find & Contact Us
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="ggh-visit-decoration">
              <span>GG</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

