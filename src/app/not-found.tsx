import Link from "next/link";
import styles from "./home.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card} style={{ textAlign: "center" }}>
        <h1 className={styles.title}>Lost Letter</h1>
        <p className={styles.subtitle}>봉인이 훼손되어 편지를 찾을 수 없어요.</p>
        <Link href="/" className={styles.secondary}>
          새 편지 쓰기
        </Link>
      </div>
    </main>
  );
}
