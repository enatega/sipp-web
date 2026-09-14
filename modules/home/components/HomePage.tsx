import styles from "@/modules/home/styles/home.module.css";

export function HomePage({ children }: { children: React.ReactNode }) {
  return <main className={styles.homePage}>{children}</main>;
}
