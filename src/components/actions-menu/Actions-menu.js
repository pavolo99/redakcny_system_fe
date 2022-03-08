import "./Actions.menu.css"

export default function ActionsMenu(props) {

  return (
      <div className="Dropdown-expansion">
        <div className="Dropdown-option" onClick={() => props.onShowArticleVersions()}>Verzie</div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option" onClick={() => props.onArchiveArticle()}
             style={{pointerEvents: props.articleStatus === 'ARCHIVED' ? 'none' : ''}}>Archivovať</div>
        <div className="Dropdown-option" onClick={() => props.onRemoveArticle()}
             style={{pointerEvents: props.articleStatus !== 'WRITING' ? 'none' : ''}}>Zmazať</div>
        <hr className="Action-menu-divider"/>
        <div className="Dropdown-option" onClick={() => props.onDenyArticle()}
             style={{pointerEvents: props.articleStatus !== 'IN_REVIEW' ? 'none' : ''}}>Zamietnuť</div>
        <div className="Dropdown-option" onClick={() => props.onPublishArticle()}
             style={{pointerEvents: props.articleStatus !== 'APPROVED' ? 'none' : ''}}>Publikovať</div>
      </div>
  );
}
