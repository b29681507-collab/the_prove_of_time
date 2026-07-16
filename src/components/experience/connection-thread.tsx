import { forwardRef } from "react";
import styles from "./experience.module.css";

export const ConnectionThread = forwardRef<SVGPathElement>(
  function ConnectionThread(_, ref) {
    return (
      <svg
        className={styles.connectionThread}
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={ref}
          className={styles.threadLive}
          d="M54 414 C160 414 178 188 326 188 C452 188 430 430 558 430 C686 430 660 196 790 196 C884 196 886 356 954 356"
          pathLength="1"
        />
      </svg>
    );
  },
);
