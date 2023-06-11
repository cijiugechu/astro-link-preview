---
layout: ../../layouts/main.astro
title: subpage
author: nemurubaka
description: naidesu
---

# How to Manage Dot Files

Dot files, or hidden files on Linux and macOS, are files that start with a "." character. These files are hidden by default and contain important configuration settings for various apps and tools. It's a good idea to manage your dot files so you have a backup and can easily set up a new system. Here are some tips for managing your dot files:
## Use a dotfile manager

A dotfile manager is a tool that helps you manage all your dotfiles in one place. Some popular options are:

- Dotbot: A tool that bootstraps your dotfiles. It allows you to put all your dotfiles in a git repository and symlink them on any new system.
- RCm: A minimalist dotfile manager that allows you to symlink your dotfiles with a YAML config file.
- Homeshick: A dotfile manager written in Bash that uses Git to store your dotfiles.

These tools make it easy to store all your dotfiles in one Git repository and symlink them on any new Linux or macOS system.
## Organize your dotfiles in a Git repository

Even if you don't use a dedicated dotfile manager, you should store your dotfiles in a Git repository. This gives you version control and a backup of all your configuration settings. You can organize your dotfiles in subdirectories based on app or category, e.g.:

```sh
.gitconfig
.vim/
.zshrc
apps/
  atom/
  vscode/
shell/
  .bash_profile
  .zshrc
``` 

Then you can symlink these files to your home directory.
## Use symlinks

Symlinks, or symbolic links, allow you to link a file in one location to another file in a different location. You can keep your dotfiles repository in a "dotfiles" folder, then symlink those files into your home directory. For example:

```bash
ln -s ~/dotfiles/.zshrc ~/.zshrc
ln -s ~/dotfiles/.vimrc ~/.vimrc
```

This will link the .zshrc and .vimrc files from your dotfiles repo to your home directory.
## Set up a new system in one command

Once you have your dotfiles in a Git repository and use symlinks to wire them up, you can set up a new system with one simple command. From your dotfiles repo, run:

```bash 
./install.sh 
```
 
Where install.sh is a script that will install any dependencies, symlink all your dotfiles to your home directory, and install any other configuration you need.

Managing your dotfiles will make your life much easier when working with different Linux and macOS systems. Using a dotfile manager and Git repository, you can keep all your settings backed up in one place and quickly set up a new development environment. 

[GitHub](https://github.com)