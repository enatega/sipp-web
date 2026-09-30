import { Icon } from "@/components/shared/brand/Icon";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import styles from "@/modules/home/styles/home.module.css";
import { PhoneStatus } from "./PhoneChrome";

/** The SIPP consumer app mock shown beside the "Everything You Need" copy. */
export async function AppPhone() {
  const t = await getTranslations("home.phone");
  const categories = [
    [t("categories.restaurants"), "store"],
    [t("categories.groceries"), "market"],
    [t("categories.drinks"), "tag"],
    [t("categories.essentials"), "catering"],
  ] as const;
  const tabs = [
    [t("tabs.home"), "store"],
    [t("tabs.category"), "market"],
    [t("tabs.deals"), "dining"],
    [t("tabs.cart"), "tag"],
    [t("tabs.account"), "community"],
  ] as const;

  return (
    <div className={cn(styles.phone, styles.phoneLg)} role="img" aria-label={t("ariaLabel")}>
      <PhoneStatus />

      <div className={styles.phoneHead}>
        <div className={styles.phoneBrand}>
          <b>
            SIPP<em>.</em>
            <i>{t("localDelivery")}</i>
          </b>
          <small>
            {t("goodMorning")}
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
          {t("deliverTo")} <Icon name="pin" className={styles.icon10} /> <b>{t("home")}</b> Santa Teresa
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
        {t("searchPlaceholder")}
        <Icon name="filter" className={cn(styles.icon12, styles.phoneSearchFilter)} />
      </div>

      <div className={styles.phoneChips}>
        {[t("chips.food"), t("chips.groceries"), t("chips.drinks"), t("chips.essentials")].map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>

      <div className={styles.phoneHeroOffer}>
        <span>
          <i>{t("offer.upTo")}</i>
          <b>70%</b>
          <em>
            {t("offer.offLocal")}
            <br />
            {t("offer.order")}
          </em>
        </span>
        <div className={styles.phoneHeroArt} />
      </div>

      <h5 className={styles.phoneHeading}>{t("offersDeals")}</h5>
      <div className={styles.phoneDeals}>
        <div className={styles.dealOrange}>
          <b>{t("flatOff")}</b>
          <small>{t("selectedBusinesses")}</small>
          <Icon name="tag" className={cn(styles.icon16, styles.dealMark)} />
        </div>
        <div className={styles.dealGreen}>
          <b>{t("free")}</b>
          <small>
            {t("delivery")}
            <br />
            {t("orders")}
          </small>
        </div>
      </div>

      <div className={styles.phoneCategories}>
        {categories.map(([label, icon]) => (
          <span key={label}>
            <i>
              <Icon name={icon} className={styles.icon14} />
            </i>
            <small>{label}</small>
          </span>
        ))}
      </div>

      <h5 className={styles.phoneHeading}>
        {t("trending")} <em>{t("viewAll")}</em>
      </h5>
      <div className={styles.phoneTrending}>
        <span />
        <span />
        <span />
      </div>

      <div className={styles.phoneNav}>
        {tabs.map(([label, icon], i) => (
          <span key={label} className={i === 0 ? styles.on : undefined}>
            <Icon name={icon} className={styles.icon14} />
            <small>{label}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
