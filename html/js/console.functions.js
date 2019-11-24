// User Commands
function echo(...a) {
	return a.join(' ')
}
echo.usage = "echo arg [arg ...]"
echo.doc = "Echos to output whatever arguments are input"

function clear() {
	$("#outputs").html("")
}
clear.usage = "clear"
clear.doc = "Clears the terminal screen"


function help(cmd) {
	if (cmd) {
		let result = ""
		let usage = cmds[cmd].usage
		let doc = cmds[cmd].doc
		result += (typeof usage === 'function') ? usage() : usage
		result += "\n"
		result += (typeof doc === 'function') ? doc() : doc
		return result
	} else {
		let result = "**Commands:**\n\n"
		print = Object.keys(cmds)
		for (let p of print) {
			result += "- " + p + "\n"
		}
		return result
	}
}
help.usage = () => "help [command]"
help.doc = () => "Without an argument, lists available commands. If used with an argument displays the usage & docs for the command."

let cmds = {
	echo,
	clear,
	help
}
function resetCmds() {
	cmds = {
		echo,
		clear,
		help
	}
}