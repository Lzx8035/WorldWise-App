import styles from "./Form.module.css";
import { useEffect, useState } from "react";
import { useURLPosition } from "../hooks/useURLPosition";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [isLoadingPos, setIsLoadingPos] = useState(false);
  const [errPos, setErrPos] = useState(null);

  const [lat, lng] = useURLPosition();

  useEffect(
    function () {
      if (!lat || !lng) return;
      async function fetchPos() {
        try {
          setIsLoadingPos(true);
          setErrPos(null);

          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();

          if (!data.city)
            throw new Error("You clicked in the middle of nowhere!🤨");

          setCityName(data.city);
          setCountry(data.country);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setErrPos(err.message);
        } finally {
          setIsLoadingPos(false);
        }
      }

      fetchPos();
    },
    [lat, lng]
  );

  if (isLoadingPos) return <Spinner />;

  if (!lat || !lng) return <Message message="Click the map! 🌎" />;

  if (errPos) return <Message message={errPos} />;

  return (
    <form className={styles.form}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
