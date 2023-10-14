import React, { useState } from "react";
import "./search-panel.css";

interface FormState {
  repo: string;
  term: string;
  author: string;
  commenter: string;
}

export function SearchPanel() {
  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
  }

  const [formState, setFormState] = useState({} as FormState);
  const [inCommentsToggle, setInCommentsToggle] = useState(false);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormState((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <div className="search-panel">
      <h3>GitHub Search Tool</h3>
      <br />
      <form onSubmit={onSubmit} className="search-form">
        <input
          name="repo"
          placeholder="Repository (org/repo)"
          value={formState.repo}
          onChange={onChange}
        />
        <input
          name="author"
          placeholder="Author (optional)"
          value={formState.author}
          onChange={onChange}
        />
        <input
          name="commenter"
          placeholder="Commenter (optional)"
          value={formState.commenter}
          onChange={onChange}
        />
        <input
          name="term"
          placeholder="Search for..."
          value={formState.term}
          onChange={onChange}
        />
        <div>
          <input
            type="checkbox"
            name="inComments"
            id="inComments"
            checked={inCommentsToggle}
            onChange={(e) => setInCommentsToggle(e.target.checked)}
          />
          <label htmlFor="inComments">Search in comments</label>
        </div>
        <button type="submit">Search!</button>
      </form>
    </div>
  );
}
