"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import styles from "./site-navigation.module.css";

export type SiteSection = "problem" | "definition" | "experience" | "how";

type SiteNavigationProps = {
  active: SiteSection;
  placement?: "fixed" | "in-flow";
  onSectionNavigate?: (section: SiteSection) => void;
};

const navigationItems: Array<{
  id: SiteSection;
  href: string;
  label: string;
}> = [
  { id: "problem", href: "/#problem", label: "发现的问题" },
  { id: "definition", href: "/#definition", label: "我们是什么" },
  { id: "experience", href: "/#experience", label: "体验一次" },
  { id: "how", href: "/#how", label: "如何发生" },
];

export function SiteNavigation({
  active,
  placement = "fixed",
  onSectionNavigate,
}: SiteNavigationProps) {
  function navigateWithinHome(
    event: MouseEvent<HTMLAnchorElement>,
    section: SiteSection,
  ) {
    if (
      !onSectionNavigate ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", `/#${section}`);
    onSectionNavigate(section);
  }

  const activeIndex = navigationItems.findIndex((item) => item.id === active) + 1;

  return (
    <header className={styles.siteNavigation} data-placement={placement}>
      <Link
        className={styles.identity}
        href="/#problem"
        aria-label="返回默认主界面"
        onClick={(event) => navigateWithinHome(event, "problem")}
      >
        <span className={styles.identityLong}>The Prove of Time</span>
        <span className={styles.identityShort} aria-hidden="true">
          T·P·T
        </span>
      </Link>

      <nav className={styles.links} aria-label="主页面导航">
        {navigationItems.map((item) => (
          <Link
            aria-current={active === item.id ? "location" : undefined}
            className={styles.link}
            href={item.href}
            key={item.id}
            onClick={(event) => navigateWithinHome(event, item.id)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <span className={styles.position} aria-hidden="true">
        {String(activeIndex).padStart(2, "0")} / 04
      </span>
    </header>
  );
}
