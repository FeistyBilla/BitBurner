export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	var server_infos = [];
	var host_scan = ns.scan();
	for (var i = 0; i < host_scan.length; i++) {
		server_infos.push(ns.getServer(host_scan[i]));
	}
	while (true) {
		var playerSkill = ns.getPlayer().skills.hacking;
		for (var i = 0; i < server_infos.length; i++) {
			var scan_results = ns.scan(server_infos[i].hostname);
			for (var j = 0; j < scan_results.length; j++) {
				if (scan_results[j] != "home") {
					var dup_check = server_infos.find(({ hostname }) => hostname == scan_results[j]);
					if (dup_check == undefined) {
						server_infos.push(ns.getServer(scan_results[j]));
					}
				}
			}
		}
		var victims = server_infos.filter(function (o) {
			return ((o.purchasedByPlayer == false) && (o.maxRam > 0) && (o.moneyMax > 0.0) && (o.requiredHackingSkill < playerSkill));
		})
		ns.clearLog();
		ns.print(" ");
		for (var i = 0; i < (victims.length); i++) {
			var v = victims[i];
			var script_ram = ns.getScriptRam("work_server.js");
			var threads = Math.trunc(v.maxRam / script_ram);
			if (!(v.sshPortOpen)) {
				ns.brutessh(v.hostname);
				ns.ftpcrack(v.hostname);
				ns.relaysmtp(v.hostname);
				ns.httpworm(v.hostname);
				ns.sqlinject(v.hostname);
			}
			if (ns.getServerNumPortsRequired(v.hostname) <= ns.getServer().openPortCount) {
				if (!(v.hasAdminRights)) {
					ns.nuke(v.hostname);
				}
			}
			if (!(ns.fileExists("work_server.js", v.hostname))) {
				ns.scp("work_server.js", v.hostname);
			}
			var running = ns.ps(v.hostname);
			if ((i > 0) && (!(running.length > 0))) {
				ns.exec("work_server.js", v.hostname, threads, victims[(i - 1)].hostname);
			}
			var moneyMax_pretty = (v.moneyMax).toLocaleString("en-US",
				{ style: "currency", currency: "USD", maximumFractionDigits: 0 });
			ns.print(v.requiredHackingSkill + " " + moneyMax_pretty + " " + v.hostname + " " + v.maxRam + " " + threads);
		}
		ns.print(server_infos.length);
		ns.print(" ");
		await ns.sleep(10000);
	}
}
