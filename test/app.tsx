import React, { useRef, useState, useEffect } from "react";

import styles from "./app.module.scss";
import "./app.scss";

export default function App() {
  const timerId = useRef<NodeJS.Timeout>();
  const [time, setTime] = useState(new Date().toUTCString());

  useEffect(() => {
    timerId.current = setInterval(
      () => setTime(new Date().toUTCString()),
      1000
    );
    return () => clearInterval(timerId.current as NodeJS.Timeout);
  }, [timerId]);

  return (
    <div className={styles.main}>
      hello world ! ! !<div>{time}</div>
    </div>
  );
}
