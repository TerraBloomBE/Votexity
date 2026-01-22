import { Player, Serenity, World } from "@serenityjs/core";
import { VotingManager } from "../api";

export const register = (source: World | Serenity) => {
	source.commandPalette.register(
		"vote",
		"Vote check command",
		(registry) => {
			registry.permissions = [];
			registry.overload({}, (context) => {
				const origin = context.origin;
				if (!(origin instanceof Player)) return;

				VotingManager.getInstance().checkVote(origin);
			});
		},
		() => {},
	);
};