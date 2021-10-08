export default function ArticleStatus(props) {
  let articleStatusName;
  switch (props.name) {
    case 'WRITING':
      articleStatusName = 'V procese'
      break;
    case 'IN_REVIEW':
      articleStatusName = 'V ' + props.reviewNumber + '. recenzii'
      break;
    case 'AFTER_REVIEW':
      articleStatusName = 'Po ' + props.reviewNumber + '. recenzii'
      break;
    case 'APPROVED':
      articleStatusName = 'Schválený'
      break;
    case 'ARCHIVED':
      articleStatusName = 'Archivovaný'
      break;
    default:
      articleStatusName = '';
  }
  return (
      <>
        {articleStatusName}
      </>
  );
}
