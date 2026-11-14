'use client';
import { useEffect, useId, useState } from 'react';
import styles from './LogoMark.module.css';

const BOLT = "M46.3434 0H54.0819V42.4919H80.9679C81.2851 42.4831 81.5964 42.5776 81.8552 42.7611C82.1141 42.9447 82.3061 43.2074 82.4028 43.5096C82.4994 43.8119 82.4952 44.1374 82.3909 44.4371C82.2866 44.7367 82.0877 44.9944 81.8243 45.1712C77.4295 48.0992 73.4157 51.5622 69.875 55.4805C65.7516 59.7861 62.3519 64.7306 59.8077 70.1225C52.8373 84.2865 53.3949 98.3708 54.0819 104.985H46.3335V62.4928H19.4475C19.1338 62.4927 18.8285 62.3919 18.5764 62.2052C18.3242 62.0185 18.1389 61.7556 18.0474 61.4554C17.9559 61.1553 17.9632 60.8337 18.0683 60.5381C18.1735 60.2424 18.3706 59.9884 18.631 59.8134C23.0253 56.8849 27.0391 53.422 30.5802 49.5041C34.6895 45.1956 38.0756 40.2512 40.6077 34.862C47.5882 20.6981 47.0305 6.61382 46.3434 0Z";   
const LEFT = "M0 52.4923C0 51.483 0.0298733 50.4869 0.0896198 49.5041C0.787222 37.142 5.79864 25.4164 14.2508 16.3703C22.703 7.32416 34.0601 1.53097 46.3434 0C47.0305 6.61382 47.5882 20.6981 40.6077 34.862C38.0756 40.2512 34.6895 45.1956 30.5802 49.5041C27.0391 53.422 23.0253 56.8849 18.631 59.8134C18.3706 59.9884 18.1735 60.2424 18.0683 60.5381C17.9632 60.8337 17.9559 61.1553 18.0474 61.4554C18.1389 61.7556 18.3242 62.0185 18.5764 62.2052C18.8285 62.3919 19.1338 62.4927 19.4475 62.4928H46.3335V104.985C36.1473 103.709 26.5519 99.4981 18.716 92.8643C10.88 86.2306 5.14195 77.4604 2.20066 67.6224C1.70699 65.9355 1.30477 64.2232 0.995776 62.4928C0.350057 59.198 0.0166534 55.8497 0 52.4923Z";
const RIGHT = "M100.455 52.4923C100.455 53.5016 100.425 54.4977 100.366 55.4805C99.6669 67.8471 94.6513 79.5764 86.193 88.6231C77.7348 97.6697 66.3708 103.46 54.0819 104.985C53.3949 98.3708 52.8373 84.2865 59.8077 70.1225C62.3519 64.7306 65.7516 59.7861 69.875 55.4805C73.4157 51.5622 77.4295 48.0992 81.8243 45.1712C82.0877 44.9944 82.2866 44.7367 82.3909 44.4371C82.4952 44.1374 82.4994 43.8119 82.4028 43.5096C82.3061 43.2074 82.1141 42.9447 81.8552 42.7611C81.5964 42.5776 81.2851 42.4831 80.9679 42.4919H54.0819V0C64.2751 1.26818 73.8792 5.47599 81.7229 12.1102C89.5664 18.7444 95.3105 27.5185 98.2546 37.3622C98.7651 39.0482 99.1838 40.7605 99.5092 42.4919C100.138 45.7882 100.455 49.1365 100.455 52.4923Z";

let hasPlayed = false;

export default function LogoMark({
  size = 56,
  animate = true,
  replayOnHover = true,
  decorative = false,
  lightOff = false,
}) {
  const [still, setStill] = useState(() => !animate || hasPlayed);
  const [run, setRun] = useState(0);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    hasPlayed = true; 
  }, []);

  const replay = () => {
    if (!animate || !replayOnHover) return;
    setStill(false);
    setRun((n) => n + 1);
  };

  const a11y = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': 'KINETICS Engineering' };

  return (
    <svg
      key={run}
      className={`${styles.mark} ${still ? styles.still : ''} ${lightOff ? styles.lightOff : ''}`}
      viewBox="0 0 101 105"
      width={size}
      height={(size * 105) / 101}
      onMouseEnter={replay}
      {...a11y}
    >
      <defs>
        <filter id={`wide-${uid}`} x="-120%" y="-40%" width="340%" height="180%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id={`tight-${uid}`} x="-80%" y="-30%" width="260%" height="160%"><feGaussianBlur stdDeviation="2.6" /></filter>
        <filter id={`hot-${uid}`} x="-30%" y="-10%" width="160%" height="120%">
          <feMorphology operator="erode" radius="3" />
          <feGaussianBlur stdDeviation="1.7" />
        </filter>
      </defs>

      <path className={styles.body} d={BOLT} />

      <path className={`${styles.half} ${styles.left}`} d={LEFT} />
      <path className={`${styles.half} ${styles.right}`} d={RIGHT} />

      <path className={`${styles.spill} ${styles.wide}`} d={BOLT} filter={`url(#wide-${uid})`} />
      <path className={`${styles.spill} ${styles.tight}`} d={BOLT} filter={`url(#tight-${uid})`} />

      <path className={styles.hot} d={BOLT} filter={`url(#hot-${uid})`} />
    </svg>
  );
}
