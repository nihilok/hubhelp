use urlencoding::encode;
use open;


fn build_search_url(term: String, repo: String, author: Option<String>, commenter: Option<String>, in_comments: bool, search_type: String) -> String {
    let mut base_url = String::from("https://github.com/search?q=");
    base_url.push_str("repo%3A");
    base_url.push_str(&encode(&repo));
    base_url.push_str(&format!("+{}", encode(&term)));
    if in_comments {
        base_url.push_str("+in%3Acomments")
    }
    if let Some(a) = author {
        if a.len() > 0 {
            base_url.push_str("&author%3A");
            base_url.push_str(&a);
        }

    }
    if let Some(c) = commenter {
        if c.len() > 0 {
            base_url.push_str("&commenter%3A");
            base_url.push_str(&c);
        }
    }
    base_url.push_str(&format!("&type={search_type}"));
    base_url
}

#[tauri::command]
pub fn gh_search(term: String, repo: String, author: Option<String>, commenter: Option<String>, in_comments: bool, search_type: String) -> Result<(), ()> {
    let search_url = build_search_url(term, repo, author, commenter, in_comments, search_type);
    match open::that(search_url) {
        Ok(_) => Ok(()),
        Err(_) => Err(())
    }
}