import styles from "./AppLayout.module.css";
import AppNav from "../components/AppNav";

function AppLayout() {
  return (
    <div className={styles.nav}>
      <AppNav />
    </div>
  );
}

export default AppLayout;
