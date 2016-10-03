" All system-wide defaults are set in $VIMRUNTIME/debian.vim and sourced by
" the call to :runtime you can find below.  If you wish to change any of those
" settings, you should do it in this file (/etc/vim/vimrc), since debian.vim
" will be overwritten everytime an upgrade of the vim packages is performed.
" It is recommended to make changes after sourcing debian.vim since it alters
" the value of the 'compatible' option.

" This line should not be removed as it ensures that various options are
" properly set to work with the Vim-related packages available in Debian.
runtime! debian.vim

" Uncomment the next line to make Vim more Vi-compatible
" NOTE: debian.vim sets 'nocompatible'.  Setting 'compatible' changes numerous
" options, so any other options should be set AFTER setting 'compatible'.
set nocompatible

" Vundle
filetype off
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
Plugin 'ryanoasis/vim-devicons'
Bundle 'scrooloose/nerdtree'
Bundle 'tyok/ack.vim'
Bundle 'tyok/nerdtree-ack'
Plugin 'vim-scripts/OmniCppComplete'
Bundle 'stephpy/vim-phpdoc'
Bundle 'Valloric/YouCompleteMe'
Bundle 'stephpy/vim-php-cs-fixer'
Bundle 'xolox/vim-easytags'
Bundle 'shawncplus/phpcomplete.vim'
Bundle 'kien/rainbow_parentheses.vim'
Bundle 'bling/vim-airline'
Plugin 'suan/vim-instant-markdown'
Plugin 'severin-lemaignan/vim-minimap'
Plugin 'airblade/vim-gitgutter'
Bundle 'xolox/vim-misc'
Plugin 'Xuyuanp/nerdtree-git-plugin'
Plugin 'tpope/vim-surround'
Plugin 'MarcWeber/vim-addon-mw-utils'
Plugin 'tomtom/tlib_vim'
"Plugin 'garbas/vim-snipmate'
Plugin 'honza/vim-snippets'
Plugin 'jplaut/vim-arduino-ino'
Plugin 'fatih/vim-go'
"Plugin 'Shougo/neocomplete.vim'
Plugin 'xolox/vim-shell'
Plugin 'majutsushi/tagbar'
Plugin 'StanAngeloff/php.vim'
Plugin 'mattn/emmet-vim'
Plugin 'mattn/webapi-vim'
Plugin 'Raimondi/delimitMate'
Plugin 'scrooloose/syntastic'
Plugin 'marijnh/tern_for_vim'
Plugin 'jelera/vim-javascript-syntax'
Plugin 'pangloss/vim-javascript'
Plugin 'nathanaelkane/vim-indent-guides'
Plugin 'skammer/vim-css-color'
Plugin 'hail2u/vim-css3-syntax'
Plugin 'sheerun/vim-polyglot'
Plugin 'nvie/vim-flake8'
Plugin 'tpope/vim-haml'

call vundle#end()
filetype plugin indent on

" Vim5 and later versions support syntax highlighting. Uncommenting the next
" line enables syntax highlighting by default.
syntax on

" If using a dark background within the editing area and syntax highlighting
" turn on this option as well
set background=dark
" colorscheme solarized

" Uncomment the following to have Vim jump to the last position when
" reopening a file
"if has("autocmd")
"  au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif
"endif

" Uncomment the following to have Vim load indentation rules and plugins
" according to the detected filetype.
if has("autocmd")
  filetype plugin indent on
endif

" The following are commented out as they cause vim to behave a lot
" differently from regular Vi. They are highly recommended though.
set showcmd		" Show (partial) command in status line.
set showmatch		" Show matching brackets.
set ignorecase		" Do case insensitive matching
set smartcase		" Do smart case matching
set incsearch		" Incremental search
set autowrite		" Automatically save before commands like :next and :make
set hidden		" Hide buffers when they are abandoned
set mouse=a		" Enable mouse usage (all modes)

" Source a global configuration file if available
if filereadable("/etc/vim/vimrc.local")
  source /etc/vim/vimrc.local
endif

set number
set linebreak
set showbreak=+++
" set textwidth=100
set visualbell
set hlsearch
set autoindent
set shiftwidth=4
set smartindent
set expandtab
set tabstop=2
set softtabstop=2
set backspace=indent,eol,start
set history=80
set ruler
set scs
set statusline=[%02n]\ %f\ %(\[%M%R%H]%)%=\ %4l,%02c%2V\ %P%*
set joinspaces
set linespace=0
set wildmenu
set scrolljump=5
set scrolloff=3
set nobackup
set noswapfile
set splitbelow
set splitright
set cursorline
set fileformat=unix
set fileformats=unix,dos,mac
set nowrap
"set colorcolumn=80
" let g:user_emmet_settings = webapi#json#decode(join(readfile(expand('~/.snippets_custom.json')), "\n"))

" File types
autocmd BufRead,BufNewFile *httpd*.conf setfiletype apache "Apache config files
autocmd BufRead,BufNewFile .htaccess    setfiletype apache "htaccess files
autocmd BufRead,BufNewFile *inc         setfiletype php "PHP include files
autocmd BufRead,BufNewFile *phtml       setfiletype php "Zend framework templates

autocmd FileType crontab    setlocal nobackup nowritebackup

cmap w!! w !sudo tee % >/dev/null
nmap <F8> :TagbarToggle<CR>

" als ge op < of > drukt, vo indent van geselcteerd
vnoremap < <gv
vnoremap > >gv

" select all
map <c-a> ggVG

" undo in insert
imap <c-z> <c-o>u
imap <C-c> <CR><Esc>O
imap <C-l> <C-x><C-o>

abbr #b /************************************************************************
abbr #e  ************************************************************************/
abbr #l *************************************************************************
abbr ehk Engaqhelekanga

" If no file specified, nerdtree
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif

map <C-n> :NERDTreeToggle<CR>
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

au BufRead,BufNewFile *.pde set filetype=arduino
au BufRead,BufNewFile *.ino set filetype=arduino

"abbr autocorrect
abbr teh the
:map <F7> :w !xclip<CR><CR>
:vmap <F7> "*y
:map <S-F7> :r!xclip -o<CR>"

" Ctrl-j/k deletes blank line below/above, and Alt-j/k inserts.
nnoremap <silent><C-j> m`:silent +g/\m^\s*$/d<CR>``:noh<CR>
nnoremap <silent><C-k> m`:silent -g/\m^\s*$/d<CR>``:noh<CR>
nnoremap <silent><A-j> :set paste<CR>m`o<Esc>``:set nopaste<CR>
nnoremap <silent><A-k> :set paste<CR>m`O<Esc>``:set nopaste<CR>
