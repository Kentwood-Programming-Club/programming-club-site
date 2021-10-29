// this is the game's filesystem
let game_files = {
    name: "home",
    files:["README.txt", "Passwords.txt"],
    folders:[
        {
            name: "secrets",
            files:["ENCRYPTED001.dat", "002.dat"],
            folders:[]
        },
        {
            name: "bin",
            files:["attacker.sh"],
            folders:[]
        }
    ]
}

// use this as a stack so push when cd'ing to new directory
// pop when `cd ..`
let current_dir = [game_files];

function print_folder(obj) {
    let out = "";
    for (let i = 0; i < obj.folders.length; i++) {
        out += "[[bg;;]" + obj.folders[i].name + "] (folder) \n";
    }
    for (let i = 0; i < obj.files.length; i++) {
        out += obj.files[i] + " (file) \n";
    }
    return out;
}


const interpreter = {
    help: function() {
        this.echo(
            "Available commands: \n" +
            "- help (see all available commands)\n" +
            "- ls (list all files in current directory)\n" +
            "- cd [folder] (change current directory)\n" +
            "- cat [file] (show file contents)\n" + 
            "- exit (close this terminal session)"
        );
    },

    ls: function () {
        this.echo(print_folder(current_dir[current_dir.length-1]));
    },

    cd: function(folder) {
            let index = current_dir[current_dir.length-1].folders.findIndex((e)=>e.name.toLowerCase() === folder.toLowerCase())
            if (folder === ".." && current_dir.length > 1) {
                current_dir.pop();
                return;
            }
            if (index !== -1) {
                current_dir.push(current_dir[current_dir.length-1].folders[index]);
            }
        },

    exit: function() {
        this.echo("[[bg;#ff0000;]YOU CANNOT.]");
    }
}

function glow_green(str) {
    return "[[bg;#13f04e;]" + str + "]";
}

// await wait(ms)
function wait(ms) {
    return new Promise(
        function() {
            setTimeout(function(){}, ms)
        }
    );
}

const terminal_settings = {
    prompt: function() {
        let path = "/";
        for (let i = 1; i < current_dir.length; i++) {
            path += current_dir[i].name + "/";
        }
        let out = '[[;#ff4c30;]root] ' + path + ' # ';
        return out;
    },
    greetings:
        "[[bg;#13f04e;]" +
               "Mainframe 2.5a\n" +
               "Checking authentication... DONE\n" +
               "Loading resources...       DONE\n" +
               "Welcome, root\nType 'help' to view commands" +
               "]"
}

let term;

let game_stage = 0;
let rm_unlocked = false;
let rm_discoverable = false;

let hints = [
    "Try seeing what folders and files are visible from here.",
    "A single character of text takes up one byte of space.",
    "None of the files are useless. Maybe look for some significant characters?",
    "You've finished the game!"
]

let encrypted_files = ["encrypted001.dat"];

let file_contents = {
    "readme.txt":"WELCOME TO MY SPACE\nYOU'LL NEVER ESCAPE THIS PLACE\nI HIDE IN PLAIN SIGHT\nPROTECTED BY FOUR BYTES",
    "passwords.txt":"aBkbi3?45#434G!Da\npassword\nYou'llNeverGuessThis\n10452\na2bc\nSb23A%\nno\n",
    "002.dat":
`
 o
-=- 
 |
/ \\

the sp00ky sk3l3t0n has c0m3 to v1s1t you
send th1s to y0ur fRiends t0 t0t4lly sp00k theM
`,
"encrypted001.dat":
`
[[bg;orange;]YOUR EFFORTS ARE FUTILE\nTHERE IS NO WAY OF]there's a hidden command that can end all this throughout the files[[bg;orange;]THERE ARE NO HIDDEN COMMANDS]
`
};

let passwords = {
    "encrypted001.dat":"a2bc"
}

function main() {
    term = $("body").terminal(
        function(command) {
            let list = command.split(" ");
            let cmd_name = list[0];
            let args = list.slice(1);
            if (cmd_name == "ls") {
                this.echo(print_folder(current_dir[current_dir.length-1]));
            } else if (cmd_name == "cd") {
                if (args.length >= 1) {
                    let folder = args[0];
                    let index = current_dir[current_dir.length-1].folders.findIndex((e)=>e.name.toLowerCase() === folder.toLowerCase())
                    if (folder === ".." && current_dir.length > 1) {
                        current_dir.pop();
                        return;
                    }
                    if (index !== -1) {
                        current_dir.push(current_dir[current_dir.length-1].folders[index]);
                    } else {
                        this.echo("cd: no such file or directory")
                    }
                } else {
                    this.echo("usage: cd [folder]\nChange current directory")
                }
            } else if (cmd_name == "cat") {
                let file = args[0].toLowerCase();
                if (file.includes("attacker.sh")) {
                    this.echo("[[bg;orange;]ACCESS DENIED.\nNOT GOOD ENOUGH]")
                } else if (file.includes("passwords.txt")) {
                    this.echo(file_contents[file])
                    game_stage = Math.max(game_stage, 1);
                } else if (encrypted_files.indexOf(file) !== -1) {
                    this.echo("[[b;;]File encrypted]");
                    this.read("Password: ", 
                    function(str) {
                    if (str == passwords[file]) {
                        term.echo("File decrypted.");
                        term.echo(file_contents[file]);
                        encrypted_files.splice(encrypted_files.indexOf(file),1);
                        if (file == "encrypted001.dat") {
                            game_stage = Math.max(game_stage, 2);
                        }
                    } else {
                        term.echo("Wrong password")
                    }},
                    function() { term.echo("Cancelled password input") });
                } else {
                    this.echo(file_contents[file])
                }

            } else if (cmd_name == "help") {

                let out = "Available commands: \n" +
                "- help (see all available commands)\n" +
                "- ls (list all files in current folder)\n" +
                "- cd [folder] (change current folder)\n" +
                "- cat [file] (show file contents)\n" + 
                "- hint (get a hint)\n" +
                "- exit (close this terminal session)\n";
                
                if (rm_unlocked) {
                    out += "- rm [file] (deletes files)"
                }

                this.echo(out);

            } else if (cmd_name == "exit") {
                if (game_stage < 4) {
                    this.echo("[[bg;#ff0000;]YOU CANNOT.]");
                } else {
                    this.echo("[[bg;cyan;]Thanks for playing!]")
                }
            } else if (cmd_name == "clear") {
                this.clear();
            } else if (cmd_name == "hint") {
                this.echo(hints[game_stage]);
            } else if (command == "rm") {
                this.echo("rm: no such file or directory\n[[bg;orange;]NO STOP WHAT ARE YOU DOING]")
                game_stage = Math.max(game_stage, 3);
            } else if (command == "rm -rf attacker.sh" || command == "rm attacker.sh") {
                this.echo("[[b;orange;]IMPOSSIB--------------------------------------------\n]File deleted successfully. Exit unlocked.");
                game_stage = 4;
            }
        },
        terminal_settings
    );
}

$(main);