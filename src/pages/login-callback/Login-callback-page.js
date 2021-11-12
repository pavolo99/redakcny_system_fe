import React from "react";
import axios from "axios";
import {apiUrl} from "../../components/environment/environment";
import {useHistory, useLocation} from "react-router-dom";

export default function LoginCallbackPage() {
  const history = useHistory();
  const search = useLocation().search;
  const accessToken = new URLSearchParams(search).get('accessToken');
  localStorage.setItem("accessToken", accessToken);

  axios.get(apiUrl + "/loggedUser").then(response => {
    localStorage.setItem("loggedUser", JSON.stringify(response.data))
    history.push('/dashboard')
  }).catch(error => {
    if (error.response.status === 401) {
      history.push('/login');
    }
  });

  return (
      <div style={{padding: '20px'}}>
        Za chvíľu budete presmerovaný...
      </div>
  );
}
