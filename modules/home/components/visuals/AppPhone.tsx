import { Icon } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";
import { PhoneStatus } from "./PhoneChrome";

const CATEGORIES = [
  ["Restaurants", "store"],
  ["Home Chefs", "dining"],
  ["Catering", "catering"],
  ["Sweets & Cakes", "tag"],
] as const;

const TABS = [
  ["Home", "store"],
  ["Category", "market"],
  ["Book a Table", "dining"],
  ["Cart", "tag"],
  ["Account", "community"],
] as const;

/** The Foodin consumer app mock shown beside the "Everything You Need" copy. */
export function AppPhone() {
  return (
    <div className={cn(styles.phone, styles.phoneLg)} role="img" aria-label="The Shaaneiol Foodin app">
      <PhoneStatus />

      <div className={styles.phoneHead}>
        <div className={styles.phoneBrand}>
          <b>
            Food<em>in</em>
            <i>For Food and Beyond</i>
          </b>
          <small>
            Good Morning
            <strong>John</strong>
          </small>
        </div>
        <span className={styles.phoneMode}>
          <i className={styles.dot} /> Food
          <Icon name="chevron" className={styles.icon10} />
        </span>
      </div>

      <div className={styles.phoneAddress}>
        <span>
          Deliver to <Icon name="pin" className={styles.icon10} /> <b>Home</b> FL 32401
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
        Search food, cuisine, restaurant...
        <Icon name="filter" className={cn(styles.icon12, styles.phoneSearchFilter)} />
      </div>

      <div className={styles.phoneChips}>
        {["Veg", "Non-Veg", "Cakes", "Fr"].map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>

      <div className={styles.phoneHeroOffer}>
        <span>
          <i>UP TO</i>
          <b>70%</b>
          <em>
            OFF FIRST
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
          <small>On selected Restaurants</small>
          <Icon name="tag" className={cn(styles.icon16, styles.dealMark)} />
        </div>
        <div className={styles.dealGreen}>
          <b>FREE</b>
          <small>
            Delivery
            <br />
            $30
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
