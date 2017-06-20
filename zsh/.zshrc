# Source Prezto.
if [[ -s "${ZDOTDIR:-$HOME}/.zprezto/init.zsh" ]]; then
  source "${ZDOTDIR:-$HOME}/.zprezto/init.zsh"
fi
#export GOPATH=/home/epse/Documents/Programming/Go

export PATH="$PATH:/home/epse/.gem/ruby/2.4.0/bin:$GOPATH/bin:/home/epse/.gem/ruby/2.4.0/bin"
# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

export EDITOR=vim
export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/ssh-agent.socket"
export PAGER=vimpager

# Damn these are so useful
autoload -U zcalc zmv

# essentially aliases cd to pushd
setopt AUTO_PUSHD
# empty pushd goes to home
setopt PUSHD_TO_HOME

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
alias dirs='dirs -v'

eval $(keychain --agents ssh,gpg --eval --quiet id_ed25519 id_rsa C74B4EB0)

mkcd () {
	if ["$2" == "-p"]; then
		case "$1" in
			*/..|*/../) cd -- "$1";; # that doesn't make any sense unless the directory already exists
			/*/../*) (cd "${1%/../*}/.." && mkdir -p "./${1##*/../}") && cd -- "$1";;
			/*) mkdir -p "$1" && cd "$1";;
			*/../*) (cd "./${1%/../*}/.." && mkdir -p "./${1##*/../}") && cd "./$1";;
			../*) (cd .. && mkdir -p "${1#.}") && cd "$1";;
			*) mkdir -p "./$1" && cd "./$1";;
		esac
	else
		case "$1" in
			*/..|*/../) cd -- "$1";; # that doesn't make any sense unless the directory already exists
			/*/../*) (cd "${1%/../*}/.." && mkdir "./${1##*/../}") && cd -- "$1";;
			/*) mkdir "$1" && cd "$1";;
			*/../*) (cd "./${1%/../*}/.." && mkdir "./${1##*/../}") && cd "./$1";;
			../*) (cd .. && mkdir "${1#.}") && cd "$1";;
			*) mkdir "./$1" && cd "./$1";;
		esac
	fi
}

insert_sudo () { zle beginning-of-line; zle -U "sudo " }
zle -N insert-sudo insert_sudo
bindkey "^[s" insert-sudo
# How is this the last line
bindkey -v
export KEYTIMEOUT=1
bindkey -M vicmd "q" push-line
