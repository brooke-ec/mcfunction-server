package ec.brooke.mcfunctionserver;

import com.mojang.brigadier.context.CommandContext;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;
import net.minecraft.ChatFormatting;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.network.chat.ClickEvent;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerPlayer;

import java.util.HashSet;
import java.util.Set;


public class AuthenticateCommand {
    private final Set<ServerPlayer> timeouts = new HashSet<>();

    public void register() {
        ServerTickEvents.END_SERVER_TICK.register(server -> timeouts.clear());
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {
            dispatcher.register(Commands.literal("editor").requires(ctx -> ctx.hasPermission(2)).executes(this::execute));
        });
    }

    private int execute(CommandContext<CommandSourceStack> ctx) throws CommandSyntaxException {
        ServerPlayer player = ctx.getSource().getPlayerOrException();
            Mod.LOGGER.info(String.valueOf(player.commandSource() != ctx.getSource().source));
        if (player.commandSource() != ctx.getSource().source && !timeouts.contains(player)) {
            ctx.getSource().sendFailure(Component.literal("[🖊] You cannot authenticate as a different player"));
            timeouts.add(player);
        } else {
            String token = Mod.webserver.generateToken(player.getUUID());
            String url = Mod.CONFIG.editorUrl.resolve("/login/" + token).toString();

            ctx.getSource().sendSuccess(
                    () -> Component.literal("[🖊] Click the link to open the editor: ")
                            .append(Component.literal(truncate(url, 40)).withStyle(style ->
                                    style.withClickEvent(new ClickEvent(ClickEvent.Action.OPEN_URL, url))
                                    .withUnderlined(true)
                                    .withColor(ChatFormatting.AQUA)
                    )), false
            );
        }

        return 1;
    }

    private String truncate(String string, int length) {
        if (string.length() > length) return string.substring(0, length - 3) + "...";
        return string;
    }
}
