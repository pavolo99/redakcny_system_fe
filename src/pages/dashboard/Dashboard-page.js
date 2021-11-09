import React, {useState} from "react";
import Header from "../../components/header/Header";
import SideBar from "../../components/sidebar/SideBar";
import ArticleList from "../../components/article-list/Article-list";
import './Dashboard-page.css'
import {useHistory} from "react-router-dom";

export default function DashboardPage() {
  const history = useHistory();

  if (!localStorage.getItem("loggedUser")) {
    history.push('/login');
  }

  const [selectedArticles, setSelectedArticles] = useState('MINE');

  return (
      <div>
        <Header/>
        <div className="Sidebar-dashboard-content">
          <SideBar setSelectedArticles={setSelectedArticles} selectedArticles={selectedArticles}/>
          <ArticleList selectedArticles={selectedArticles}/>
        </div>
      </div>
  );
}
