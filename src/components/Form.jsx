// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";

// contexts
import { useCities } from "../contexts/CitiesContext";
import useURLPosition from "../hooks/useURLPosition";

// components
import Button from "./Button";
import ButtonBack from "./ButtonBack";
import Message from "./Message";
import Spinner from "./Spinner";

// styles
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Form.module.css";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState(null);
  const [emoji, setEmoji] = useState(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [errorGeoCoding, setErrorGeoCoding] = useState(null);

  // custom hooks
  const { createCity } = useCities();
  const { mapLat, mapLng } = useURLPosition();

  useEffect(() => {
    const fetchCity = async () => {
      if (!mapLat || !mapLng) return;
      try {
        setIsLoadingGeoCoding(true);
        setErrorGeoCoding(null);
        const response = await fetch(
          `${BASE_URL}?latitude=${mapLat}&longitude=${mapLng}&localityLanguage=en`
        );
        const data = await response.json();

        if (!data.countryCode)
          throw new Error(
            "That doesn't look like a city. Try clicking somewhere else."
          );

        setCityName(data.city || data.locality || "");
        setCountry(data.countryName || "");
        setEmoji(convertToEmoji(data.countryCode));
      } catch (error) {
        setErrorGeoCoding(error.message);
      } finally {
        setIsLoadingGeoCoding(false);
      }
    };

    fetchCity();
  }, [mapLat, mapLng]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cityName) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: {
        lat: mapLat,
        lng: mapLng,
      },
    };

    await createCity(newCity);
    navigate("/app");
  };

  if (!mapLat || !mapLng)
    return <Message message='Start by selecting a location on the map' />;
  if (isLoadingGeoCoding) return <Spinner />;
  if (errorGeoCoding) return <Message message={errorGeoCoding} />;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor='cityName'>City name</label>
        <input
          id='cityName'
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor='date'>When did you go to {cityName}?</label>
        <DatePicker
          id='date'
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat='dd/mm/yyyy'
        />
      </div>

      <div className={styles.row}>
        <label htmlFor='notes'>Notes about your trip to {cityName}</label>
        <textarea
          id='notes'
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type='primary'>Add</Button>
        <ButtonBack />
      </div>
    </form>
  );
}

export default Form;
