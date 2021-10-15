import "./Actions.menu.css"

export default function ActionsMenu(props) {

  return (
      <div className="Dropdown-expansion">
        <div className="Dropdown-option">Verzie</div>
        <div className="Dropdown-option">História komentárov</div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option"
             onClick={() => props.onArchiveArticle()}>Archivovať
        </div>
        <div className="Dropdown-option"
             onClick={() => props.onRemoveArticle()}>Zmazať
        </div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option"
             onClick={() => props.onDownloadArticle()}>Stiahnuť
        </div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option"
             onClick={() => props.onDenyArticle()}>Zamietnuť
        </div>
        <div className="Dropdown-option"
             onClick={() => props.onPublishArticle()}>Publikovať
        </div>
      </div>
  );
}
