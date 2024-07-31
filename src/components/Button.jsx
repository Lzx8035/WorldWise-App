import styles from "./Button.module.css";

function Button({ onClick, children, type }) {
  return (
    <div onClick={onClick} className={`${styles.btn} ${styles[type]}`}>
      {children}
    </div>
  );
}

export default Button;
