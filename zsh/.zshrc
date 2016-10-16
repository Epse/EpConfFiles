# Source Prezto.
if [[ -s "${ZDOTDIR:-$HOME}/.zprezto/init.zsh" ]]; then
  source "${ZDOTDIR:-$HOME}/.zprezto/init.zsh"
fi
export GOPATH=/home/epse/Documents/Programming/Go

# User configuration

  export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:/home/epse/.gem/ruby/2.3.0/bin"
# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

export EDITOR=vim

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="~/.ssh/dsa_id"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
alias sps='sudo pacman -S'
alias acs='apt-cache search'
alias acsh='apt-cache show'
alias svim='sudo vim'
alias sagr='sudo apt-get remove'
alias sagp='sudo apt-get purge'
alias -g dbx='~/Dropbox'
alias -g fndin='| grep -i '
alias -g fndsn='| grep  '
alias e=$EDITOR
alias x=exit
