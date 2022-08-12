import React from "react";
import App from "../App";

function Failure({ msg }) {
  const handleClick = () => {
    return <App />;
  };
  return (
    <div>
      <h5>{msg}</h5>
      <button onClick={handleClick}> Back to Vote Again</button>
    </div>
  );
}

export default Failure;
