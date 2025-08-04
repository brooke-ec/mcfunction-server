package ec.brooke.mcfunctionserver;

import com.mojang.brigadier.context.CommandContext;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import com.mojang.brigadier.exceptions.SimpleCommandExceptionType;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;
import net.minecraft.ChatFormatting;
import net.minecraft.commands.CommandSource;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.network.chat.ClickEvent;
import net.minecraft.network.chat.Component;
import net.minecraft.server.dedicated.DedicatedServer;
import net.minecraft.server.level.ServerPlayer;

import java.util.UUID;


public class AuthenticateCommand {
    private final SimpleCommandExceptionType SOURCE_MISMATCH = new SimpleCommandExceptionType(Component.literal("Command source mismatch"));

    public void register() {
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {
            dispatcher.register(Commands.literal("editor").requires(ctx -> ctx.hasPermission(2)).executes(this::execute));
        });
    }

    private int execute(CommandContext<CommandSourceStack> ctx) throws CommandSyntaxException {
        UUID uuid;

        // Check for source integrity and get UUID
        if (ctx.getSource().source instanceof DedicatedServer) uuid = new UUID(0, 0);
        else {
            ServerPlayer player = ctx.getSource().getPlayerOrException();
            if (player.commandSource() != ctx.getSource().source) {
                ctx.getSource().sendFailure(Component.literal("[🖊] You cannot authenticate as a different player"));
                throw SOURCE_MISMATCH.create();
            } else uuid = player.getUUID();
        }

        // Generate token and respond login URL
        String token = Mod.webserver.generateToken(uuid);
        String url = Mod.CONFIG.editorUrl.resolve("/login/" + token).toString();
        ctx.getSource().sendSuccess(
                () -> Component.literal("[🖊] Click the link to open the editor: ")
                        .append(Component.literal(url).withStyle(style ->
                                style.withClickEvent(new ClickEvent(ClickEvent.Action.OPEN_URL, url))
                                        .withUnderlined(true)
                                        .withColor(ChatFormatting.AQUA)
                        )), false
        );

        return 1;
    }
}
