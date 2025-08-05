package ec.brooke.mcfunctionserver;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.metadata.ModMetadata;
import net.minecraft.world.level.storage.LevelResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Path;

public class Mod implements ModInitializer {

    public static final String MOD_ID = "mcfunctionserver";
    public static final ModConfig CONFIG = ModConfig.load();
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);
    public static final ModMetadata METADATA = FabricLoader.getInstance().getModContainer(MOD_ID).orElseThrow().getMetadata();
    public static Webserver webserver;

    @Override
    public void onInitialize() {
        new AuthenticateCommand().register();
        ServerLifecycleEvents.SERVER_STARTING.register(server -> {
            // Initialize datapack read/write wrapper
            Path root = server.getWorldPath(LevelResource.DATAPACK_DIR).resolve(CONFIG.datapackName);
            PackAccessor accessor = new PackAccessor(root);
            try { accessor.validate(); } catch (IOException e) { throw new RuntimeException(e); }

            // Start the webserver on a new thread
            webserver = new Webserver(accessor);
            new Thread(webserver::run).start();
        });
    }
}
