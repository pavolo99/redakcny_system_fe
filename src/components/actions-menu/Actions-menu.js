import "./Actions.menu.css"

export default function ActionsMenu() {

  function onDenyArticle() {
  }

  function onRemoveArticle() {
  }

  function onDownloadArticle() {
  }

  function onPublishArticle() {
  }

  return (
      <div className="Dropdown-expansion">
        <div className="Dropdown-option">Verzie</div>
        <div className="Dropdown-option">História komentárov</div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option">Archivovať</div>
        <div className="Dropdown-option" onClick={() => onRemoveArticle()}>Zmazať</div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option" onClick={() => onDownloadArticle()}>Stiahnuť</div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option" onClick={() => onDenyArticle()}>Zamietnuť</div>
        <div className="Dropdown-option" onClick={() => onPublishArticle()}>Publikovať</div>
      </div>
  );
}
