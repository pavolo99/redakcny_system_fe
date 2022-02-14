import React from "react";
import axios from "axios";
import {useHistory, useLocation} from "react-router-dom";
import {handle401Error} from "../../shared/Utils";

export default function LoginCallbackPage() {
  const history = useHistory();
  const search = useLocation().search;
  const accessToken = new URLSearchParams(search).get('accessToken');
  localStorage.setItem("accessToken", accessToken);

  axios.get(process.env.REACT_APP_BECKEND_API_URL + "/user/logged")
  .catch(error => handle401Error(error, history))
  .then(response => {
    if (response) {
      localStorage.setItem("loggedUser", JSON.stringify(response.data))
      history.push('/dashboard')
    }
  });

  return (
      <div style={{padding: '20px'}}>
        Za chvíľu budete presmerovaný...
      </div>
  );
}
