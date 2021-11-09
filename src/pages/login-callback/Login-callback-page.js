import React from "react";
import axios from "axios";
import {apiUrl} from "../../components/environment/environment";
import {useHistory} from "react-router-dom";

export default function LoginCallbackPage() {
  const history = useHistory();

  React.useEffect(() => {
    axios.get(apiUrl + '/loggedUser')
    .then(response => {
      localStorage.setItem("loggedUser", JSON.stringify(response.data))
      history.push('/dashboard')
    })
    .catch((error) => {
      if (error.response.status === 404) {
        history.push('/login');
      }
    });
  })

  return (
      <>
      </>
  );
}
