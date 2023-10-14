use std::{env, io};
use std::fs::{File};
use std::io::{Read, Write};
use crate::errors;

pub fn get_token_file_path() -> String {
    let home = env::var("HOME").expect("HOME var should exist");
    format!("{home}/.hubhelp.token")
}

pub fn read_token_file_path() -> Result<String, io::Error> {
    let file_path = get_token_file_path();
    let mut file = File::open(&file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

pub fn write_token_to_file(token: &str) {
    let file_path = get_token_file_path();
    let mut file = File::create(&file_path).expect("file should exist");
    file.write_all(token.as_bytes()).expect("should be able to write to file");
}

pub fn get_token_env_var() -> Result<String, env::VarError> {
    let token_name = "GH_NOTIFIER_TOKEN";
    Ok(env::var(token_name)?)
}

pub fn get_token() -> Result<String, errors::RuntimeErrors> {
    match get_token_env_var() {
        Ok(token) => Ok(token),
        Err(_) => {
            Ok(read_token_file_path()?)
        }
    }
}
