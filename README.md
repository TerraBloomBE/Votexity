# Votexity

Lightweight voting plugin for SerenityJS. Integrates with [minecraftpocket-servers.com](https://minecraftpocket-servers.com).

## Usage
Just place the `votexity` .plugin file in your `plugins` directory.

## Types Installation

```bash
npm install votexity
```

## Configuration

Config file: `./plugins/configs/votexity/config.yml`

```yaml
apiKey: "your-api-key"
autoclaim: true
voteAnnouncement: "§l§7{§aVOTE§7}§r §a{username} §7has voted! Use §e/vote §7to claim rewards."
messageNotVoted: "§l§7{§cVOTE§7}§r §7You haven't voted today! Vote at §ehttps://minecraftpocket-servers.com"
messageVoted: "§l§7{§aVOTE§7}§r §7You have already claimed your vote today!"
disableClaimMessage: false
```

| Option | Description |
|--------|-------------|
| `apiKey` | Your minecraftpocket-servers.com API key |
| `autoclaim` | Auto-check votes every 30 seconds |
| `voteAnnouncement` | Broadcast message when someone votes (`{username}` placeholder) |
| `disableClaimMessage` | Disable built-in messages to handle them yourself |

## Listening for Votes

```typescript
import type { VotexityPlugin } from "votexity";

const plugin = this.pipeline.plugins.get("votexity") as VotexityPlugin;

if (plugin) {
  plugin.getVoteManager().on("vote", (username) => {
    // Handle vote rewards here
  });
}
```

## License

MIT
