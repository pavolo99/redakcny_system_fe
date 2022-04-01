export default function ArticleStatus(props) {
  const reviewNumber = props.reviewNumber;
  let articleStatusName;
  switch (props.name) {
    case 'WRITING':
      articleStatusName = 'V procese' + (reviewNumber === 0 ? '' : ' (po ' + props.reviewNumber + '. recenzii)')
      break;
    case 'IN_REVIEW':
      articleStatusName = 'V ' + reviewNumber + '. recenzii'
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
