import React from "react";
import Header from "../../components/header/Header";
import SideBar from "../../components/sidebar/SideBar";
import Dashboard from "../../components/dashboard/Dashboard";
import classes from './Dashboard-page.css'

export default function DashboardPage() {

  return (
      <div>
        <Header/>
        <div className="Sidebar-dashboard-content">
          <SideBar/>
          <Dashboard/>
        </div>
      </div>
  );
}
