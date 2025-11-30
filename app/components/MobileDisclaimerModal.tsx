"use client";

import React from "react";

const STORAGE_KEY = "vic-power-mobile-disclaimer-dismissed";

export default function MobileDisclaimerModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "true";
    const smallScreen = window.innerWidth <= 768;

    setIsSmallScreen(smallScreen);

    if (smallScreen && !dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  if (!isOpen || !isSmallScreen) {
    return null;
  }

  return (
    <div className="mobile-disclaimer" role="dialog" aria-modal="true" aria-label="Mobile experience notice">
      <div className="mobile-disclaimer__backdrop" onClick={handleDismiss} />
      <div className="mobile-disclaimer__dialog">
        <h2 className="mobile-disclaimer__title">Best viewed on desktop</h2>
        <p className="mobile-disclaimer__body">
          This site has been designed for desktop screens. On phones and small tablets some layouts, charts or
          interactions may not work as expected.
        </p>
        <p className="mobile-disclaimer__body">
          You can keep browsing on this device, but for the best experience please visit on a laptop or desktop
          computer.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="mobile-disclaimer__button"
        >
          Continue on this device
        </button>
      </div>
    </div>
  );
}

