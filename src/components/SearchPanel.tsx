import React, { useEffect, useState } from "react";
import "./search-panel.css";
import { invoke, InvokeArgs } from "@tauri-apps/api/tauri";
import classNames from "classnames";

interface FormState extends InvokeArgs {
  repo: string;
  term: string;
  author: string | null;
  commenter: string | null;
  searchType: string;
}

export function SearchPanel() {
  const [formState, setFormState] = useState({
    searchType: "pullrequests",
    repo: localStorage.getItem("current-repo") ?? "",
  } as FormState);
  const [inCommentsToggle, setInCommentsToggle] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    let payload: FormState;
    if (codeSearch) {
      payload = {
        repo: formState.repo,
        term: formState.term,
        author: null,
        commenter: null,
        searchType: formState.searchType,
        inComments: false,
      };
    } else {
      payload = { ...formState, inComments: inCommentsToggle };
    }

    await invoke("gh_search", { ...payload });
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormState((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
    if (event.target.name === "repo") {
      localStorage.setItem("current-repo", event.target.value);
    }
  }

  let codeSearch = !["pullrequests", "issues"].includes(formState.searchType);
  useEffect(() => {
    if (codeSearch) {
      setInCommentsToggle(false);
    }
  }, [formState.searchType]);

  return (
    <div className="search-panel">
      <form onSubmit={onSubmit} className="search-form">
        <div
          className={classNames("input-wrapper", {
            "show-label": formState.repo,
          })}
          data-label="Repo"
        >
          <input
            name="repo"
            placeholder="Repository (org/repo)"
            value={formState.repo}
            onChange={onChange}
            required={true}
            className="repo-input"
            autoCorrect="off"
            autoCapitalize="none"
          />
        </div>
        <div className="type-radio-group">
          <div>
            <input
              type="radio"
              name="type"
              value="pullrequests"
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  searchType: e.target.value,
                }))
              }
              defaultChecked={true}
              id="type-pulls"
            />
            <label htmlFor="type-pulls">Pulls</label>
          </div>
          <div>
            <input
              type="radio"
              name="type"
              value="issues"
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  searchType: e.target.value,
                }))
              }
              id="type-issues"
            />
            <label htmlFor="type-issues">Issues</label>
          </div>
          <div>
            <input
              type="radio"
              name="type"
              value="code"
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  searchType: e.target.value,
                }))
              }
              id="type-code"
            />
            <label htmlFor="type-code">Code</label>
          </div>
        </div>
        <div
          className={classNames("input-wrapper", {
            "show-label": formState.term,
          })}
          data-label="Query"
        >
          <input
            name="term"
            placeholder="Search for..."
            value={formState.term}
            onChange={onChange}
            autoCorrect="off"
            autoCapitalize="none"
          />
        </div>
        <div
          className={classNames("input-wrapper", {
            "show-label": formState.author,
          })}
          data-label="Author"
        >
          <input
            name="author"
            placeholder="Author (optional)"
            value={formState.author ?? ""}
            onChange={onChange}
            disabled={codeSearch}
            autoCorrect="off"
            autoCapitalize="none"
          />
        </div>
        <div
          className={classNames("input-wrapper", {
            "show-label": formState.commenter,
          })}
          data-label="Commenter"
        >
          <input
            name="commenter"
            placeholder="Commenter (optional)"
            value={formState.commenter ?? ""}
            onChange={onChange}
            disabled={codeSearch}
            autoCorrect="off"
            autoCapitalize="none"
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <input
            type="checkbox"
            name="inComments"
            id="inComments"
            checked={inCommentsToggle}
            onChange={(e) => setInCommentsToggle(e.target.checked)}
            disabled={codeSearch}
          />
          <label htmlFor="inComments">Search in comments</label>
        </div>
        <button type="submit" style={{ margin: "0 auto" }}>
          Search!
        </button>
      </form>
    </div>
  );
}
