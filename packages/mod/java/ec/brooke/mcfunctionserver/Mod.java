package ec.brooke.mcfunctionserver;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.minecraft.world.level.storage.LevelResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Path;

public class Mod implements ModInitializer {

    public static final String MOD_ID = "mcfunctionserver";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitialize() {
        ServerLifecycleEvents.SERVER_STARTED.register(server -> {
            // Initialize datapack read/write wrapper
            Path root = server.getWorldPath(LevelResource.DATAPACK_DIR).resolve("editor");
            PackAccessor accessor = new PackAccessor(root);
            try { accessor.validate(); } catch (IOException e) { throw new RuntimeException(e); }

            // Start the webserver on a new thread
            new Thread(new Server(accessor)::run).start();
        });
    }
}
