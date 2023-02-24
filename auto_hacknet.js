export async function main(ns) {
	while (true) {
		var player_money = ns.getPlayer().money;
		var money_pretty = (player_money).toLocaleString("en-US",
			{ style: "currency", currency: "USD", maximumFractionDigits: 0 });
		ns.print("Total Money = " + money_pretty);
		var nodes_n = ns.hacknet.numNodes();
		if (nodes_n < 3) {
			var budget = player_money * 0.9;
		} else if (nodes_n < 6) {
			var budget = player_money * 0.5;
		} else if (nodes_n < 9) {
			var budget = player_money * 0.3;
		} else if (nodes_n < 12) {
			var budget = player_money * 0.2;
		} else if (nodes_n < 15) {
			var budget = player_money * 0.1;
		} else {
		var budget = player_money * 0.01;
		}
		var budget_pretty = (budget).toLocaleString("en-US",
			{ style: "currency", currency: "USD", maximumFractionDigits: 0 });
		ns.print("Budget = " + budget_pretty);

		var new_node_cost = ns.hacknet.getPurchaseNodeCost();
		var cost_table = [];
		for (var i = 0; i < nodes_n; i++) {
			var cost_data = {
				"lvlcst": (ns.hacknet.getLevelUpgradeCost(i, 10)),
				"ramcst": (ns.hacknet.getRamUpgradeCost(i, 1)),
				"corcst": (ns.hacknet.getCoreUpgradeCost(i, 1)),
				"node": i
			}
			cost_table.push(cost_data);
		}
		var min_upgrade = {
			"node": -Infinity,
			"cost": Infinity,
			"feature": null
		}
		for (var i = 0; i < nodes_n; i++) {
			if (cost_table[i].lvlcst < min_upgrade.cost) {
				min_upgrade.node = cost_table[i].node;
				min_upgrade.cost = cost_table[i].lvlcst;
				min_upgrade.feature = "level";
			}
			if (cost_table[i].ramcst < min_upgrade.cost) {
				min_upgrade.node = cost_table[i].node;
				min_upgrade.cost = cost_table[i].ramcst;
				min_upgrade.feature = "ram";
			}
			if (cost_table[i].corcst < min_upgrade.cost) {
				min_upgrade.node = cost_table[i].node;
				min_upgrade.cost = cost_table[i].corcst;
				min_upgrade.feature = "core";
			}
		}
		if (new_node_cost < min_upgrade.cost) {
			min_upgrade.node = -Infinity;
			min_upgrade.cost = new_node_cost;
			min_upgrade.feature = "new";
		}
		if (min_upgrade.cost < budget) {
			switch (min_upgrade.feature) {
				case "level":
					ns.hacknet.upgradeLevel(min_upgrade.node);
					break;
				case "ram":
					ns.hacknet.upgradeRam(min_upgrade.node);
					break;
				case "core":
					ns.hacknet.upgradeCore(min_upgrade.node);
					break;
				case "new":
					ns.hacknet.purchaseNode();
					break;
				default:
					ns.print("Something broke...");
					ns.exit();
			}
		}
		await ns.sleep(200);
	}
}