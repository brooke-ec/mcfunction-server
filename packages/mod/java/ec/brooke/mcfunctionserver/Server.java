package ec.brooke.mcfunctionserver;

import io.javalin.Javalin;
import io.javalin.http.Context;
import net.minecraft.resources.ResourceLocation;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import static io.javalin.apibuilder.ApiBuilder.*;

public class Server {
    private final PackAccessor accessor;

    public Server(PackAccessor accessor) {
        this.accessor = accessor;
    }

    public void run() {
        Javalin.create(config -> {
            config.useVirtualThreads = true;
            config.http.asyncTimeout = 10_000L;
            config.showJavalinBanner = false;
            config.staticFiles.add("/public");
            config.router.apiBuilder(() -> {
                path("/api", () -> {
                    get("/index", this::index);
                    path("/file/<path>", () -> {
                        get(this::read);
                    });
                });
            });
        }).start(Mod.CONFIG.address.getHostString(), Mod.CONFIG.address.getPort());
    }

    private void index(Context ctx) throws IOException {
        ctx.json(Arrays.stream(accessor.index())
                .filter(l -> l.getNamespace().equals(Mod.CONFIG.namespace))
                .map(ResourceLocation::getPath).toList()
        );
    }

    private void read(Context ctx) throws IOException {
        Path path = accessor.getPath(ResourceLocation.fromNamespaceAndPath(Mod.CONFIG.namespace, ctx.pathParam("path")));
        if (Files.exists(path) && path.normalize().startsWith(accessor.root.normalize()))
            ctx.result(new FileInputStream(path.toFile())).contentType("text/mcfunction");
        else ctx.status(404);
    }
}
