/**
 * Voting configuration interface
 */
export interface VotingConfig {
    /** API key for minecraftpocket-servers.com */
    apiKey: string;
    /** Whether to automatically check for votes every 30 seconds */
    autoclaim: boolean;
    /** Message broadcast when a player votes */
    voteAnnouncement: string;
    /** Message when player hasn't voted */
    messageNotVoted: string;
    /** Message when player has already claimed their vote */
    messageVoted: string;
    /** Disable claim messages (let other plugins handle them) */
    disableClaimMessage: boolean;
}

/**
 * Default voting configuration
 */
export const DEFAULT_VOTING_CONFIG: VotingConfig = {
    apiKey: "",
    autoclaim: true,
    voteAnnouncement:
        "§l§7{§aVOTE§7}§r §a{username} §7has voted! Use §e/vote §7to claim rewards.",
    messageNotVoted:
        "§l§7{§cVOTE§7}§r §7You haven't voted today! Vote at §ehttps://minecraftpocket-servers.com",
    messageVoted: "§l§7{§aVOTE§7}§r §7You have already claimed your vote today!",
    disableClaimMessage: false,
};
