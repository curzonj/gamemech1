Babel needs the files that it's expected to rewrite nested in the same directory as
babel itself. React webpack isn't as picky, so we put the shared files in the api
directory and use a symlink from the client to this direct.