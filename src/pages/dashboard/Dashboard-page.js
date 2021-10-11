import React, {useState} from "react";
import Header from "../../components/header/Header";
import SideBar from "../../components/sidebar/SideBar";
import ArticleList from "../../components/articleList/ArticleList";
import './Dashboard-page.css'

export default function DashboardPage() {
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
