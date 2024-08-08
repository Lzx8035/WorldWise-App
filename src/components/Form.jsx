import styles from "./Form.module.css";
import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useState } from "react";
import { useURLPosition } from "../hooks/useURLPosition";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate(); //BUG

  const [lat, lng] = useURLPosition();
  const { createCity, isLoading } = useCities();

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
      // id: JSON-SERVER automatically generates it for us as you post a new resource
    };

    await createCity(newCity);
    navigate("/app/cities");
    // 当您使用 navigate("app/cities") 时，React Router 将这个路径解释为相对于当前路径的路径。如果您当前在 /app/form 路径下，它会将新路径附加到当前路径后面，结果就是 /app/form/app/cities。
    // 解决方法：使用绝对路径：navigate("/app/cities");
  }

  if (isLoadingPos) return <Spinner />;

  if (!lat || !lng) return <Message message="Click the map! 🌎" />;

  if (errPos) return <Message message={errPos} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
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
        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/YY"
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
