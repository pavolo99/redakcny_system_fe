import "./Sidebar.css"

export default function SideBar(props) {
  const selectedArticles = props.selectedArticles;

  function onSelectArticlesType(filterType) {
    props.setSelectedArticles(filterType);
  }

  return (
      <div className="SideBar">
        <div className={selectedArticles === 'MINE' ? 'SideBar-item Active-item'
            : 'SideBar-item'}
             onClick={() => onSelectArticlesType('MINE')}>
          <div>Moje články</div>
        </div>
        <div className={selectedArticles === 'SHARED_WITH_ME' ? 'SideBar-item Active-item'
            : 'SideBar-item'}
             onClick={() => onSelectArticlesType('SHARED_WITH_ME')}>
          <div>Zdieľané so mnou</div>
        </div>
        <div className={selectedArticles === 'ARCHIVED' ? 'SideBar-item Active-item'
            : 'SideBar-item'}
             onClick={() => onSelectArticlesType('ARCHIVED')}>
          <div>Archivované</div>
        </div>
        <div className={selectedArticles === 'REVIEWED_BY_ME' ? 'SideBar-item Active-item'
            : 'SideBar-item'}
             onClick={() => onSelectArticlesType('REVIEWED_BY_ME')}>
          <div>Mnou recenzované</div>
        </div>
        <div className={selectedArticles === 'APPROVED' ? 'SideBar-item Active-item'
            : 'SideBar-item'}
             onClick={() => onSelectArticlesType('APPROVED')}>
          <div>Schválené</div>
        </div>
      </div>
  );
}
