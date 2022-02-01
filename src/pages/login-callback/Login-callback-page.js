import React from "react";
import axios from "axios";
import {apiUrl} from "../../components/environment/environment";
import {useHistory, useLocation} from "react-router-dom";
import {handle401Error} from "../../shared/Utils";

export default function LoginCallbackPage() {
  const history = useHistory();
  const search = useLocation().search;
  const accessToken = new URLSearchParams(search).get('accessToken');
  localStorage.setItem("accessToken", accessToken);

  axios.get(apiUrl + "/user/logged")
  .catch(error => handle401Error(error, history))
  .then(response => {
    localStorage.setItem("loggedUser", JSON.stringify(response.data))
    history.push('/dashboard')
  });

  return (
      <div style={{padding: '20px'}}>
        Za chvíľu budete presmerovaný...
      </div>
  );
}
