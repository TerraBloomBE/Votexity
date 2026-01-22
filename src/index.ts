import { Plugin, PluginEvents, PluginPriority } from "@serenityjs/plugins";
import { ConfigManager, DEFAULT_VOTING_CONFIG, VotingConfig } from "./config";
import { VotingManager } from "./api";
import { WorldEvent } from "@serenityjs/core";
import { VoteCommand } from "./commands";

class VotexityPlugin extends Plugin implements PluginEvents {
  public readonly priority: PluginPriority = PluginPriority.High;
  private vconfig!: ConfigManager<VotingConfig>;
  private votingManager!: VotingManager;

  public constructor() {
    super("votexity", "1.0.0");
  }

  public onInitialize(): void {
    this.logger.info("Votexity plugin initialized!");
    this.vconfig = new ConfigManager<VotingConfig>(
      "./plugins/configs/votexity",
      "config",
      DEFAULT_VOTING_CONFIG,
    );
    this.votingManager = VotingManager.getInstance();
    this.votingManager.initialize(this.serenity, this.logger);
    this.votingManager.setConfig(this.vconfig.get());
    VoteCommand.register(this.serenity);
  }

  public getVoteManager(): VotingManager {
    return this.votingManager;
  }

  public onStartUp(): void {
    this.logger.info("Votexity plugin started up!");

    this.serenity.after(WorldEvent.PlayerInitialized, ({ player }) => {
      this.votingManager.startAutoclaim(player);
    });

    this.serenity.after(WorldEvent.PlayerLeave, ({ player }) => {
      this.votingManager.stopAutoclaim(player.xuid);
    });
    
    this.serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
      VoteCommand.register(world);
    })
  }

  public onShutDown(): void {
    this.logger.info("Votexity plugin shut down!");
  }
}

export default new VotexityPlugin();

// Export types and classes for external use
export * from "./api";
export * from "./config";
export * from "./emitter";
export { VotexityPlugin }