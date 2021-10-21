// this is the game's filesystem
let game_files = {
    name: "home",
    files:["README.txt", "Passwords.txt"],
    folders:[
        {
            name: "SECRETS",
            files:["ENCRYPTED001.dat", "002.dat"],
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
        out += "[[bg;;]" + obj.folders[i].name + "]\n";
    }
    for (let i = 0; i < obj.files.length; i++) {
        out += obj.files[i] + "\n";
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

function main() {
    term = $("body").terminal(
        interpreter,
        terminal_settings
    );
}

$(main);