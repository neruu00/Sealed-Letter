import HomeForm from "./HomeForm";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>✠ &nbsp;Sigillum&nbsp; ✠</p>
        <h1 className={styles.title}>Sealed Letter</h1>
        <p className={styles.subtitle}>사진 한 장을 밀랍으로 봉인해, 링크로 보내세요.</p>
      </header>
      <HomeForm />
    </main>
  );
}
