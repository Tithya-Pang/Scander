
import { useState } from "react";
import { categories, menuItems, filterMenu } from "../../data/menu";
import "../../styles/public-pages.css";

export default function Menu() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const visibleItems = filterMenu(
    menuItems,
    category,
    search
  );

  return (
    <main className="gg-public-menu">
      {/* Page introduction */}
      <section className="gg-container gg-menu-intro">
        <span className="gg-kicker">
          GATHER GROUNDS / OUR MENU
        </span>

        <h1>
          Something delicious
          <br />
          <em>for every moment.</em>
        </h1>

        <p>
          Discover our selection of coffee, drinks, meals,
          and sweet treats. Browse our menu before visiting
          Gather Grounds.
        </p>
      </section>

      {/* Menu collection */}
      <section className="gg-container gg-menu-section">
        <div className="gg-menu-toolbar">
          <div>
            <span className="gg-kicker">
              EXPLORE OUR COLLECTION
            </span>
            <h2>Our food & drinks</h2>
          </div>

          <input
            type="search"
            className="gg-menu-search"
            placeholder="Search for your favorites..."
            aria-label="Search menu"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* Category filters */}
        <div
          className="gg-menu-filters"
          role="group"
          aria-label="Filter menu by category"
        >
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className={
                category === name ? "active" : ""
              }
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Menu cards */}
        {visibleItems.length > 0 ? (
          <div className="gg-public-menu-grid">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="gg-public-menu-card"
              >
                <div className="gg-public-menu-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <span>Photo coming soon</span>
                  )}
                </div>

                <div className="gg-public-menu-info">
                  <span className="gg-public-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="gg-public-menu-bottom">
                    <strong>
                      {item.price == null
                        ? "Price coming soon"
                        : `$${Number(item.price).toFixed(2)}`}
                    </strong>

                    <span>View only</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="gg-menu-empty">
            <h3>No dishes found</h3>
            <p>Try another category or search term.</p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Show all dishes
            </button>
          </div>
        )}
      </section>

      {/* Dining information */}
      <section className="gg-menu-notice">
        <div className="gg-container gg-menu-notice-inner">
          <div>
            <span className="gg-kicker">
              DINING AT GATHER GROUNDS
            </span>

            <h2>Ready to enjoy your meal?</h2>

            <p>
              Visit Gather Grounds and scan the QR code
              at your table to place your order directly
              through Scander.
            </p>
          </div>

          <div className="gg-menu-notice-icon">
            <svg
              viewBox="0 0 24 24"
              width="70"
              height="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="2" width="7" height="7" />
              <rect x="15" y="2" width="7" height="7" />
              <rect x="2" y="15" width="7" height="7" />
              <path d="M4 4h3v3H4zM17 4h3v3h-3zM4 17h3v3H4z" />
              <path d="M13 12h3v3h-3zM19 12h3M12 19h3M19 18v4M15 22h2" />
            </svg>
          </div>
        </div>
      </section>
    </main>
  );
}
