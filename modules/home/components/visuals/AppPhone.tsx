import { Icon } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";
import { PhoneStatus } from "./PhoneChrome";

const CATEGORIES = [
  ["Restaurants", "store"],
  ["Groceries", "market"],
  ["Drinks", "tag"],
  ["Essentials", "catering"],
] as const;

const TABS = [
  ["Home", "store"],
  ["Category", "market"],
  ["Deals", "dining"],
  ["Cart", "tag"],
  ["Account", "community"],
] as const;

/** The SIPP consumer app mock shown beside the "Everything You Need" copy. */
export function AppPhone() {
  return (
    <div className={cn(styles.phone, styles.phoneLg)} role="img" aria-label="The SIPP customer app">
      <PhoneStatus />

      <div className={styles.phoneHead}>
        <div className={styles.phoneBrand}>
          <b>
            SIPP<em>.</em>
            <i>Local delivery</i>
          </b>
          <small>
            Good Morning
            <strong>John</strong>
          </small>
        </div>
        <span className={styles.phoneMode}>
          <i className={styles.dot} /> SIPP
          <Icon name="chevron" className={styles.icon10} />
        </span>
      </div>

      <div className={styles.phoneAddress}>
        <span>
          Deliver to <Icon name="pin" className={styles.icon10} /> <b>Home</b> Santa Teresa
        </span>
        <span className={styles.phoneAddressActions}>
          <Icon name="community" className={styles.icon12} />
          <i className={styles.cartDot}>
            <Icon name="tag" className={styles.icon12} />
          </i>
        </span>
      </div>

      <div className={styles.phoneSearch}>
        <Icon name="search" className={styles.icon12} />
        Search food, groceries, drinks...
        <Icon name="filter" className={cn(styles.icon12, styles.phoneSearchFilter)} />
      </div>

      <div className={styles.phoneChips}>
        {["Food", "Groceries", "Drinks", "Essentials"].map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>

      <div className={styles.phoneHeroOffer}>
        <span>
          <i>UP TO</i>
          <b>70%</b>
          <em>
            OFF LOCAL
            <br />
            ORDER
          </em>
        </span>
        <div className={styles.phoneHeroArt} />
      </div>

      <h5 className={styles.phoneHeading}>Offers &amp; Deals</h5>
      <div className={styles.phoneDeals}>
        <div className={styles.dealOrange}>
          <b>FLAT 20% OFF</b>
          <small>At selected SIPP businesses</small>
          <Icon name="tag" className={cn(styles.icon16, styles.dealMark)} />
        </div>
        <div className={styles.dealGreen}>
          <b>FREE</b>
          <small>
            Delivery
            <br />
            orders
          </small>
        </div>
      </div>

      <div className={styles.phoneCategories}>
        {CATEGORIES.map(([label, icon]) => (
          <span key={label}>
            <i>
              <Icon name={icon} className={styles.icon14} />
            </i>
            <small>{label}</small>
          </span>
        ))}
      </div>

      <h5 className={styles.phoneHeading}>
        Trending Near You <em>View all</em>
      </h5>
      <div className={styles.phoneTrending}>
        <span />
        <span />
        <span />
      </div>

      <div className={styles.phoneNav}>
        {TABS.map(([label, icon], i) => (
          <span key={label} className={i === 0 ? styles.on : undefined}>
            <Icon name={icon} className={styles.icon14} />
            <small>{label}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
