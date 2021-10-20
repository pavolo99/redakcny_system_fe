import "./Article-status-dropdown.css"
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import React from "react";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiFilledInput-root": {
      background: "rgb(255,255,255)"
    }
  }
}));

export default function ArticleStatusDropdown(props) {
  return (
      <FormControl className={useStyles().root + ' Article-status-dropdown'}
                   variant="filled"
                   disabled={props.selectedArticles === 'APPROVED'
                   || props.selectedArticles === 'ARCHIVED'}>
        <InputLabel>Stav článku</InputLabel>
        <Select value={props.articleStatus}
                onChange={(event) => props.filterArticlesByStatus(event)}>
          <MenuItem value="ALL">Všetky</MenuItem>
          <MenuItem value="WRITING">V procese</MenuItem>
          <MenuItem value="IN_REVIEW">Pripravené na recenziu</MenuItem>
          <MenuItem value="AFTER_REVIEW">Po recenzii</MenuItem>
        </Select>
      </FormControl>
  );
}
