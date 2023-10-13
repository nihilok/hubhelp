use reqwest;
use std::{env, fmt, io};

#[derive(Debug)]
pub enum RuntimeErrors {
    IO(io::Error),
    Var(env::VarError),
    Request(reqwest::Error),
}

impl fmt::Display for RuntimeErrors {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            RuntimeErrors::IO(ref err) => err.fmt(f),
            RuntimeErrors::Var(ref err) => err.fmt(f),
            RuntimeErrors::Request(ref err) => err.fmt(f),
        }
    }
}

impl From<io::Error> for RuntimeErrors {
    fn from(err: io::Error) -> RuntimeErrors {
        RuntimeErrors::IO(err)
    }
}

impl From<env::VarError> for RuntimeErrors {
    fn from(err: env::VarError) -> RuntimeErrors {
        RuntimeErrors::Var(err)
    }
}

impl From<reqwest::Error> for RuntimeErrors {
    fn from(err: reqwest::Error) -> RuntimeErrors {
        RuntimeErrors::Request(err)
    }
}

