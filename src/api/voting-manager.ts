import type { Player, Serenity } from "@serenityjs/core";
import type { Plugin } from "@serenityjs/plugins";
import { EventEmitter } from "../emitter";
import type { VotexityEvents } from "../emitter";
import { DEFAULT_VOTING_CONFIG, type VotingConfig } from "../config";

export enum VoteStatus {
    NOT_VOTED = 0,
    VOTED_UNCLAIMED = 1,
    VOTED_CLAIMED = 2,
}

/**
 * VotingManager - Handles vote checking and emits events
 * Uses minecraftpocket-servers.com API
 */
export class VotingManager extends EventEmitter<VotexityEvents> {
    private static _instance: VotingManager;
    private config: VotingConfig;
    private autoclaimSimulations: Map<string, ReturnType<Serenity["simulate"]>> = new Map();
    private serenity!: Serenity;
    private logger!: Plugin["logger"];

    private constructor() {
        super();
        this.config = { ...DEFAULT_VOTING_CONFIG };
    }

    public static getInstance(): VotingManager {
        if (!VotingManager._instance) {
            VotingManager._instance = new VotingManager();
        }
        return VotingManager._instance;
    }

    public initialize(serenity: Serenity, logger: Plugin["logger"]): void {
        this.serenity = serenity;
        this.logger = logger;
    }

    public setConfig(config: Partial<VotingConfig>): void {
        this.config = { ...this.config, ...config };
    }

    public getConfig(): VotingConfig {
        return this.config;
    }

    public isConfigured(): boolean {
        return this.config.apiKey !== "";
    }

    public startAutoclaim(player: Player): void {
        if (!this.config.autoclaim || !this.isConfigured()) return;

        const xuid = player.xuid;

        this.stopAutoclaim(xuid);

        // Check every 30 seconds
        const simulation = this.serenity.simulate(30, () => {
            if (!player.isAlive) {
                this.stopAutoclaim(xuid);
                return;
            }
            this.checkVote(player, false);
        });

        this.autoclaimSimulations.set(xuid, simulation);

        this.checkVote(player, false);
    }

    public stopAutoclaim(xuid: string): void {
        const simulation = this.autoclaimSimulations.get(xuid);
        if (simulation) {
            simulation.destroy();
            this.autoclaimSimulations.delete(xuid);
        }
    }

    private async checkVoteStatus(username: string): Promise<VoteStatus> {
        try {
            const url = `https://minecraftpocket-servers.com/api/?object=votes&element=claim&key=${this.config.apiKey}&username=${encodeURIComponent(username)}`;
            const response = await fetch(url);
            const text = await response.text();
            const status = parseInt(text);

            if (isNaN(status)) {
                this.logger.error(`[Voting] Invalid API response: ${text}`);
                return VoteStatus.NOT_VOTED;
            }

            return status as VoteStatus;
        } catch (error) {
            this.logger.error(`[Voting] Failed to check vote status: ${error}`);
            return VoteStatus.NOT_VOTED;
        }
    }

    /**
     * Claim the vote via API (marks it as claimed)
     */
    private async claimVote(username: string): Promise<boolean> {
        try {
            const url = `https://minecraftpocket-servers.com/api/?action=post&object=votes&element=claim&key=${this.config.apiKey}&username=${encodeURIComponent(username)}`;
            const response = await fetch(url, { method: "POST" });
            const text = await response.text();
            const result = parseInt(text);
            return result === 1;
        } catch (error) {
            this.logger.error(`[Voting] Failed to claim vote: ${error}`);
            return false;
        }
    }

    /**
     * Check and process a player's vote
     * @param player The player to check
     * @param sendMessage Whether to send feedback messages
     */
    public async checkVote(player: Player, sendMessage: boolean = true): Promise<void> {
        if (!this.isConfigured()) {
            if (sendMessage) {
                player.sendMessage("§l§7{§cVOTE§7}§r §7Voting is not configured on this server.");
            }
            return;
        }

        const username = player.username;
        const status = await this.checkVoteStatus(username);

        switch (status) {
            case VoteStatus.NOT_VOTED:
                if (sendMessage) {
                    player.sendMessage(this.config.messageNotVoted);
                }
                break;

            case VoteStatus.VOTED_UNCLAIMED: {
                const claimed = await this.claimVote(username);
                if (!player.isAlive) return;

                if (!claimed) {
                    if (!this.config.disableClaimMessage) {
                        player.sendMessage("§l§7{§cVOTE§7}§r §7Error happened while processing your vote.");
                    }
                    return;
                }

                this.emit("vote", username);

                if (this.config.voteAnnouncement && !this.config.disableClaimMessage) {
                    const announcement = this.config.voteAnnouncement.replace("{username}", username);
                    this.serenity.getWorlds().forEach((world) => {
                        world.sendMessage(announcement);
                    });
                }
                break;
            }

            case VoteStatus.VOTED_CLAIMED:
                if (sendMessage) {
                    player.sendMessage(this.config.messageVoted);
                }
                break;
        }
    }

    /**
     * Check if a player has voted (for external use)
     * @param username Player username
     * @param includeUnclaimed If true, returns true for unclaimed votes too
     */
    public async hasVoted(username: string, includeUnclaimed: boolean = false): Promise<boolean> {
        if (!this.isConfigured()) return false;

        const status = await this.checkVoteStatus(username);

        if (includeUnclaimed) {
            return status >= VoteStatus.VOTED_UNCLAIMED;
        }
        return status === VoteStatus.VOTED_CLAIMED;
    }
}
