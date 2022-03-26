import "./Comment-section.css"
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useHistory} from "react-router-dom";
import Avatar from "react-avatar";
import {
  convertTimestampToDate,
  generateHSLColorBasedOnUserInfo,
  getFullName,
  getUserValue, handle401Error
} from "../../shared/Utils";
import {Button, TextField} from "@material-ui/core";
import {Checkbox} from "@mui/material";

export default function CommentSection(props) {
  const history = useHistory();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentReply, setCommentReply] = useState({commentId: 0, text: ''});
  const [showAllComments, setShowAllComments] = useState(false);

  function fetchComments(allComments) {
    if (props.articleId) {
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/comment/' + props.articleId + '/' + (allComments ?? showAllComments))
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          const comments = response.data;
          comments.forEach(comment => {
            if (comment.commentReplyDtoList == null) {
              comment.commentReplyDtoList = [];
            }
          })
          setComments(comments);
        }
      });
    }
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.articleId])

  function onCommentMouseEnterEvent(comment) {
    if (!commentReply.text) {
      setCommentReply(prevState => {
        return {...prevState, commentId: comment.id}
      });
      props.selectCommentedText(comment.rangeFrom, comment.rangeTo);
    }
  }

  const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

  function onCommentReplyValueChange(value) {
    setCommentReply(prevState => {
      return {...prevState, text: value}
    });
  }

  function resetCommentReply() {
    setCommentReply(prevState => {
      return {...prevState, text: ''}
    });
  }

  function createCommentReply(commentId) {

    axios.post(process.env.REACT_APP_BECKEND_API_URL + '/comment-reply/' + commentId, {text: commentReply.text})
    .catch((error) => handle401Error(error, history))
    .then(response => {
      if (response) {
        fetchComments();
      }
    })
    resetCommentReply();
  }

  function onDeleteCommentReply(commentReplyId) {
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/comment-reply/' + commentReplyId)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        fetchComments();
      }
    })
  }

  function onCommentValueChange(value) {
    setCommentText(value);
  }

  function cancelComment() {
    props.setIsNewCommentIconClicked(false);
    setCommentText('')
  }

  function createComment(articleId) {
    let commentCreateDto = {
      rangeFrom: props.selectionRange.from,
      rangeTo: props.selectionRange.to,
      commentedText: props.commentedText,
      text: commentText
    }
    axios.post(process.env.REACT_APP_BECKEND_API_URL + '/comment/' + articleId, commentCreateDto)
    .catch((error) => handle401Error(error, history))
    .then(response => {
      if (response) {
        fetchComments();
      }
    })
    setCommentText('')
    props.setIsNewCommentIconClicked(false)
  }

  function toggleCommentResolved(commentId) {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/comment/resolved/' + commentId + '/toggle', {})
    .catch((error) => handle401Error(error, history))
    .then(response => {
      if (response) {
        fetchComments();
      }
    });
  }

  function onDeleteComment(commentId) {
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/comment/' + commentId)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        fetchComments();
      }
    })
  }

  const mappedCommentsWithItsReplies = <div className="Comments-list">
    {comments.map(comment =>
        <div key={comment.id} className="Comment"
             onMouseEnter={() => onCommentMouseEnterEvent(comment)}>
          <div className="Mark-solved-row">
            <span className="Mark-solved-button" onClick={() => toggleCommentResolved(comment.id)}>
              {comment.resolved ? 'Označiť ako nevyriešené' : 'Označiť ako vyriešené'}
            </span>
          </div>
          <div className="Avatar-time-row">
            <Avatar name={getFullName(comment.createdBy)} fgColor="white" round={true} style={{cursor: 'default'}}
                    size="35" color={generateHSLColorBasedOnUserInfo(getUserValue(comment.createdBy))}/>
            <div className="Comment-right-side">
              <div className="Updated-at">{convertTimestampToDate(comment.updatedAt)}</div>
              <div className="Text">{comment.text}</div>
              {loggedUser.id === comment.createdBy.id && !comment.commentReplyDtoList.length ?
                  <div className="Remove-button" onClick={() => onDeleteComment(comment.id)}>Vymazať</div> : null}
            </div>
          </div>
          {comment.commentReplyDtoList.map(commentReply =>
              <div key={commentReply.id}>
                <div className="Avatar-time-row">
                  <Avatar name={getFullName(commentReply.createdBy)} fgColor="white" round={true} style={{cursor: 'default'}}
                          size="35" color={generateHSLColorBasedOnUserInfo(getUserValue(commentReply.createdBy))}/>
                  <div className="Comment-right-side">
                    <div className="Updated-at">{convertTimestampToDate(commentReply.updatedAt)}</div>
                    <div className="Text">{commentReply.text}</div>
                    {loggedUser.id === commentReply.createdBy.id ? <div className="Remove-button" onClick={() => onDeleteCommentReply(commentReply.id)}>Vymazať</div> : null}
                  </div>
                </div>
              </div>
          )}
          {commentReply.commentId === comment.id ? <div className="Reply-avatar-input-row">
            <Avatar name={getFullName(loggedUser)} fgColor="white" round={true} style={{cursor: 'default'}}
                    size="35" color={generateHSLColorBasedOnUserInfo(getUserValue(loggedUser))}/>
            <TextField variant="standard" placeholder="Napíšte vašu odpoveď"
                       value={commentReply.text} multiline
                       inputProps={{ maxLength: 1000 }}
                       style={{width: "100%", marginLeft: '1rem'}} name="reply"
                       onChange={(event) => onCommentReplyValueChange(
                           event.target.value)}/>
          </div> : null}
          {commentReply.commentId === comment.id && commentReply.text ? <div className="Comment-reply-buttons-row">
            <Button className="Comment-reply-button-cancel" onClick={resetCommentReply}>Zrušiť</Button>
            <Button className="Comment-reply-button-submit" onClick={() => createCommentReply(comment.id)}>Odoslať</Button>
          </div> : null}
        </div>)}
  </div>

  function onFetchComments(allComments) {
    setShowAllComments(prevState => !prevState);
    fetchComments(allComments);
  }

  return (
      <div className="Comments-section">
        <div className="Comments-all-checkbox-row"><Checkbox checked={showAllComments}
                       onChange={(event) => onFetchComments(event.target.checked)}/>
          Zobraziť aj vyriešené komentáre
        </div>
        {props.isNewCommentIconClicked ? <div className="Comment New-comment">
          <div className="Add-comment-avatar-input-row">
            <Avatar name={getFullName(loggedUser)} fgColor="white" round={true} style={{cursor: 'default'}}
                    size="35" color={generateHSLColorBasedOnUserInfo(getUserValue(loggedUser))}/>
            <TextField variant="standard" placeholder="Napíšte komentár"
                       value={commentText} multiline
                       style={{width: "100%", marginLeft: '1rem'}}
                       name="comment" inputProps={{ maxLength: 1000 }}
                       onChange={(event) => onCommentValueChange(
                           event.target.value)}/>
          </div>
          <div className="Comment-reply-buttons-row">
            <Button className="Comment-reply-button-cancel" onClick={cancelComment}>Zrušiť</Button>
            {commentText ? <Button className="Comment-reply-button-submit" onClick={() => createComment(props.articleId)}>Odoslať</Button> : null}
          </div>
        </div> : null}
        {mappedCommentsWithItsReplies}
      </div>
  );
};
